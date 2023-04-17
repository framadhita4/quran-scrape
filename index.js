import fetch from "node-fetch";
import fs from "node:fs";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const getAudioUrl = (number) => {
  const obj = {};
  const audio = [
    "ahmedajamy",
    "alafasy",
    "hudhaify",
    "husary",
    "husarymujawwad",
    "mahermuaiqly",
    "minshawi",
    "muhammadayyoub",
    "muhammadjibreel",
    "shaatree",
  ];
  audio.forEach(
    (e) =>
      (obj[
        e
      ] = `https://cdn.islamic.network/quran/audio/128/ar.${e}/${number}.mp3`)
  );
  return obj;
};

const doRequest = async (surah, page) => {
  const data = await fetch(
    `https://api.qurancdn.com/api/qdc/verses/by_chapter/${surah}?words=true&translation_fields=resource_name%2Clanguage_id&per_page=6&fields=text_uthmani%2Cchapter_id%2Chizb_number%2Ctext_imlaei_simple&translations=134&reciter=7&word_translation_language=id&page=${page}&word_fields=verse_key%2Cverse_id%2Cpage_number%2Clocation%2Ctext_uthmani%2Ccode_v1%2Cqpc_uthmani_hafs&mushaf=2`
  );
  return data.json();
};

const getWord = (words) => {
  const arr = [];
  for (let i = 0; i < words.length; i++) {
    arr.push({
      id: words[i].id,
      line_number: words[i].line_number,
      audio_url: words[i].audio_url
        ? `https://audio.qurancdn.com/${words[i].audio_url}`
        : null,
      text: words[i].text_uthmani,
      translation: words[i].translation.text,
      transliteration: words[i].transliteration.text,
    });
  }
  return arr;
};

const getVerses = (data) => {
  return {
    id: data.id,
    chapter_id: data.chapter_id,
    verse_key: data.verse_key,
    hizb_number: data.hizb_number,
    rub_el_hizb_number: data.rub_el_hizb_number,
    ruku_number: data.ruku_number,
    manzil_number: data.manzil_number,
    page_number: data.page_number,
    juz_number: data.juz_number,
    text_uthmani: data.text_uthmani,
    audio_url: getAudioUrl(data.id),
    words: getWord(data.words),
    translation: {
      text: data.translations[0].text,
      resource_name: data.translations[0].resource_name,
    },
  };
};

const saveVerses = async (verses, surah_number) => {
  for (let i = 0; i < verses.length; i++) {
    fs.writeFileSync(
      `./quran/surah/surah_${surah_number}/verses_${verses[i].verse_number}.json`,
      JSON.stringify(getVerses(verses[i]), null, 2)
    );
    process.stdout.write("\u001b[2J\u001b[0;0H");
    console.log(
      `processing : surah-${surah_number} verses-${verses[i].verse_number}`
    );
  }
};

for (let i = 1; i <= 144; i++) {
  const data = await doRequest(i, 1);
  for (let j = 1; j <= data.pagination.total_pages; j++) {
    const data = await doRequest(i, j);
    await saveVerses(data.verses, i);
  }
  await sleep(1000);
}
