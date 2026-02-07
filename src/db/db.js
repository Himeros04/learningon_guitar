import Dexie from 'dexie';
import { CHORD_DB } from './chords'; // Import static chords to seed them
import { normalizeChordData } from '../utils/chordNormalizer';

export const db = new Dexie('GuitarAppDB');

// Version 1: Original schema (keep for migration path)
db.version(1).stores({
  folders: '++id, name, parent_id',
  songs: '++id, title, artist, folder_id, updated_at',
  chords: '++id, name, category, tags'
});

// Version 2: Firebase-compatible schema with new fields
db.version(2).stores({
  folders: '++id, name, parentId, createdAt, icon', // Renamed parent_id → parentId
  songs: '++id, title, artist, folderId, type, isFavorite, originalKey, currentKey, bpm, durationSec, createdAt, updatedAt',
  chords: '++id, name, category, tags, normalizedData' // Added normalizedData for consistent format
}).upgrade(async tx => {
  console.log('Upgrading database to version 2...');

  // Migrate folders: rename parent_id to parentId
  await tx.table('folders').toCollection().modify(folder => {
    if (folder.parent_id !== undefined) {
      folder.parentId = folder.parent_id;
      delete folder.parent_id;
    }
    if (!folder.createdAt) {
      folder.createdAt = new Date().toISOString();
    }
  });

  // Migrate songs: add new fields and rename conventions
  await tx.table('songs').toCollection().modify(song => {
    // Rename folder_id → folderId
    if (song.folder_id !== undefined) {
      song.folderId = song.folder_id;
      delete song.folder_id;
    }

    // Add type field (default to chordpro since all existing songs are text-based)
    if (!song.type) {
      song.type = 'chordpro';
    }

    // Add isFavorite
    if (song.isFavorite === undefined) {
      song.isFavorite = false;
    }

    // Add key fields (null means not set)
    if (song.originalKey === undefined) {
      song.originalKey = null;
    }
    if (song.currentKey === undefined) {
      song.currentKey = null;
    }

    // Add bpm (null means not set)
    if (song.bpm === undefined) {
      song.bpm = null;
    }

    // Rename duration → durationSec
    if (song.duration !== undefined) {
      song.durationSec = song.duration;
      delete song.duration;
    }

    // Rename timestamps
    if (song.created_at !== undefined) {
      song.createdAt = song.created_at;
      delete song.created_at;
    }
    if (song.updated_at !== undefined) {
      song.updatedAt = song.updated_at;
      delete song.updated_at;
    }
  });

  // Migrate chords: normalize data format
  await tx.table('chords').toCollection().modify(chord => {
    if (chord.data) {
      // Store normalized version alongside original for backward compatibility
      chord.normalizedData = normalizeChordData(chord.data);
    }
  });

  console.log('Database upgrade to version 2 complete!');
});

db.folders.hook('creating', function (primKey, obj, transaction) {
  if (!obj.createdAt) {
    obj.createdAt = new Date().toISOString();
  }
});

db.songs.hook('creating', function (primKey, obj, transaction) {
  obj.createdAt = new Date().toISOString();
  obj.updatedAt = new Date().toISOString();
  // Ensure new fields have defaults
  if (obj.type === undefined) obj.type = 'chordpro';
  if (obj.isFavorite === undefined) obj.isFavorite = false;
});

db.songs.hook('updating', function (mods, primKey, obj, transaction) {
  mods.updatedAt = new Date().toISOString();
});

// Seeding Function
db.on('populate', async () => {
  // 1. Create Default Folders (Favoris first)
  const folderFavoris = await db.folders.add({ name: '⭐ Favoris', icon: 'star', createdAt: new Date().toISOString() });
  const folderRock = await db.folders.add({ name: 'Rock Classics', createdAt: new Date().toISOString() });
  const folderBossa = await db.folders.add({ name: 'Bossa Nova', createdAt: new Date().toISOString() });
  const folderReggae = await db.folders.add({ name: 'Reggae Vibes', createdAt: new Date().toISOString() });
  const folderFlamenco = await db.folders.add({ name: 'Flamenco', createdAt: new Date().toISOString() });

  // 2. Create Sample Songs
  await db.songs.bulkAdd([
    {
      title: 'No Woman No Cry',
      artist: 'Bob Marley',
      folderId: folderReggae,
      type: 'chordpro',
      isFavorite: false,
      content: `[C]No woman, no [G/B]cry
[Am]No [F]woman, no cry
[C]No woman, no [G/B]cry
[Am]No [F]woman, no cry`,
      image: 'https://upload.wikimedia.org/wikipedia/en/2/23/Bob_Marley_and_the_Wailers_-_Live%21_.jpg',
      durationSec: 245
    },
    {
      title: 'Knockin on Heavens Door',
      artist: 'Bob Dylan',
      folderId: folderRock,
      type: 'chordpro',
      isFavorite: false,
      content: `[G]Mama take this [D]badge off of [Am]me
[G]I can't [D]use it any[C]more`,
      image: 'https://upload.wikimedia.org/wikipedia/en/3/36/Knockin%27_on_Heaven%27s_Door_Promotional_Single.jpg',
      durationSec: 150
    },
    {
      title: 'Morro da Casa Verde',
      artist: 'Adoniran Barbosa',
      folderId: folderBossa,
      type: 'chordpro',
      isFavorite: false,
      content: `[Am]Silêncio é [Dm]madrugada
[E7]No Morro da Casa Verde a raça [Am]dorme em [F]paz[E7]
[Am]E lá embaixo meu [A7]colegas de [Dm]maloca
[E7]Quando começam a sambar não [Am]param [E7]mais, Silêncio!

[Am]Silêncio é [Dm]madrugada
[E7]No Morro da Casa Verde a raça [Am]dorme em [F]paz[E7]
[Am]E lá embaixo meu [A7]colegas de [Dm]maloca
[E7]Quando começam a sambar não [Am]param [A7]mais

[Dm]Valdir vai buscar o [Am]tambor
[Dm]Laércio traz o [Am]agogô
[F]Que o samba na casa [E7]verde enfe[Am]zou
[F]Que o samba na casa [E7]verde enfe[Am]zou[E7], Silêncio!`,
      image: '',
      durationSec: 180
    }
  ]);

  // 3. Seed Chords from Static DB + Categories
  const chordsToSeed = [];

  // Import Standard Chords from CHORD_DB
  Object.entries(CHORD_DB).forEach(([bgKey, variations]) => {
    // bgKey = C, Cm, etc.
    // Let's categorize them roughly
    let category = 'Standard';
    if (bgKey.includes('7') || bgKey.includes('maj') || bgKey.includes('dim')) category = 'Jazz/Complex';

    // Add the main version
    chordsToSeed.push({
      name: bgKey,
      category: category,
      tags: ['Majeur', 'Mineur'].filter(t => bgKey.includes('m') ? t === 'Mineur' : t === 'Majeur'), // Basic auto-tagging
      data: variations // Store the object structure directly { positions: [...] }
    });
  });

  // Add specific style chords requested by user
  chordsToSeed.push(
    { name: 'Em9', category: 'Bossa Nova', tags: ['Bossa', 'Jazz'], data: { strings: { 6: 0, 5: 2, 4: 4, 3: 0, 2: 3, 1: 0 }, fingers: { 5: 1, 4: 2, 2: 3 } } },
    { name: 'A7(b9)', category: 'Flamenco', tags: ['Flamenco', 'Phrygian'], data: { strings: { 6: -1, 5: 0, 4: 2, 3: 3, 2: 2, 1: 3 }, fingers: { 4: 2, 3: 3, 2: 1, 1: 4 } } },
    // Chords for Adoniran Barbosa
    { name: 'A7', category: 'Samba', tags: ['Samba'], data: { strings: { 6: -1, 5: 0, 4: 2, 3: 0, 2: 2, 1: 0 }, fingers: { 4: 2, 2: 2 } } },
    { name: 'Am', category: 'Samba', tags: ['Samba'], data: { strings: { 6: -1, 5: 0, 4: 2, 3: 2, 2: 1, 1: 0 }, fingers: { 4: 2, 3: 3, 2: 1 } } },
    { name: 'Dm', category: 'Samba', tags: ['Samba'], data: { strings: { 6: -1, 5: -1, 4: 0, 3: 2, 2: 3, 1: 1 }, fingers: { 3: 2, 2: 3, 1: 1 } } },
    { name: 'E7', category: 'Samba', tags: ['Samba'], data: { strings: { 6: 0, 5: 2, 4: 2, 3: 1, 2: 3, 1: 0 }, fingers: { 5: 2, 4: 2, 3: 1, 2: 3 } } }, // Alternative E7 open
    { name: 'F', category: 'Samba', tags: ['Samba'], data: { strings: { 6: 1, 5: 3, 4: 3, 3: 2, 2: 1, 1: 1 }, fingers: { 6: 1, 5: 3, 4: 3, 3: 2, 2: 1, 1: 1 } } } // Full Barre
  );

  await db.chords.bulkAdd(chordsToSeed);
  console.log("Database seeded with test data!");
});
