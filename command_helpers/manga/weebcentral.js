const axios = require('axios');
const AigisError = require('../../utils/AigisError');
const path = require('path');
const cheerio = require('cheerio');
//const playwright = require('playwright');
const { downloadImage } = require('../../utils/utils');
const { insertManga, mangaChannelNSFW } = require('./manga-general');
const config = require('../../utils/config');


function get_nsfw_rating($) {
  //get adult content rating
  const mangaInfo = $('#top').children().first().children().first().children().last()
  const tags = mangaInfo.children().first().children().first().next()
  const tagsText = tags.text().toLowerCase();
  return tagsText.includes('adult') || tagsText.includes('hentai')
}

/** The display name of the website */
exports.NAME = 'WeebCentral';

/** 
 * True if the followManga method can determine the age rating of a manga. False if not. Some cases:
 * - True if the website has the data available via an API like Mangadex
 * - True if the website does not host pornographic/18+ manga like Mangapill
 * - False if the website hosts pornographic manga and does not have a way to determine the rating like Mangakakalot
 */
exports.CAN_CHECK_RATING = true;

/** 
 * Get a string detailing how to get the Manga ID for a manga on this website
 * @returns {String} A string with the help message for how to get the Manga ID for a manga on this website
 */
exports.getIdHelpString = () => {
  let str = 'Navigate to the overview page of the manga you wish to follow. The URL will look something like https://weebcentral.com/series/01J76XYCRVY3QGYAMRR3STW941/Chainsaw-Man. ';
  str += 'The ID is the string of characters after /series/ and before the next /. So in this case, you would enter `01J76XYCRVY3QGYAMRR3STW941` as the ID in commands. ';
  str += 'Note that the title is not required to be in the URL so it might be absent, but the ID is always present and required.';
  return str;
}

/**
 * If a database entry for the manga does not exist, create one. If one does exist add this user to the ping list
 * Uses the insertManga function from manga-general.js to insert the manga into the database
 * @param {String} manga_id The ID of the manga to follow
 * @param {String} user_id The user ID of the person following the manga
 * @param {Object} guild The guild object of the server the command was run in
 * @param {String} [lang="en"] The language to follow the manga in. Default is English
 * @returns {Promise<String>} Manga title
 */
exports.followManga = async (manga_id, user_id, guild, lang = 'en') => {
  const guild_id = guild.id;
  let ch_nsfw = await mangaChannelNSFW(guild);
  const headers = { 'User-Agent': config.get('USER_AGENT'), 'Referer': 'https://weebcentral.com' };
  const ret = await axios.get(`https://weebcentral.com/series/${manga_id}`, { headers });
  if (ret.status !== 200) {
    if (ret.status >= 500) {
      throw new AigisError(`WeebCentral seems to be experiencing issues, please try again later.`);
    }
    throw new AigisError(`I could not find manga with ID ${manga_id} on WeebCentral.`);
  }
  const $ = cheerio.load(ret.data);
  const has_adult_content = get_nsfw_rating($);
  //get chapter data
  const chapter = $('#chapter-list').find('a').first();
  const chapterText = chapter.children().first().next().children().first().text();
  const latest_chapter_num = chapterText.split('Chapter ')[1] ?? 0;
  const latest_chapter = chapter.attr('href').split('chapters/')[1] ?? 0;
  //get cover art
  let cover_file_name = 'https://i.imgur.com/usdIJxN.png';
  if (has_adult_content && !ch_nsfw) {
    throw new AigisError(`this manga is pornographic or otherwise too explicit. Please mark the manga channel as age-restricted to follow this manga.`);
  }
  if (!has_adult_content) {
    // get actual cover art if its not porn
    cover_file_name = await getCoverArt($);
  }
  //get title
  const title = $('h1').first().text();

  let manga = {
    title: title,
    manga_id: manga_id,
    lang: lang,
    latest_chapter: latest_chapter,
    latest_chapter_num: latest_chapter_num,
    cover_art: cover_file_name,
    ping_list: { [`${guild_id}`]: [user_id] },
    website: 'weebcentral',
    nsfw: has_adult_content
  }
  await insertManga(manga, guild_id, user_id);
  return title;
}

/**
 * Get cover art
 * @returns {Promise<String>} The filename of the cover art. Not the whole path, just the filename.
 */
async function getCoverArt($) {
  try {
    const img = $('picture').first().children().last().attr('src'); //image link
    let img_name_init = `weebcentral-${img.split('/').pop()}`;
    const img_name = img_name_init.split('?')[0];
    await downloadImage(img, path.join(__dirname, '..', '..', 'assets', 'images', img_name), 'https://weebcentral.com');
    return img_name;
  } catch (err) {
    console.error(err);
    return config.get('DEFAULT_MANGA_IMAGE');
  }
}

/**
 * Check for manga updates and return an object with the newest information. The object should have the form of:
 * {
 *  latest_chapter: The ID of the latest chapter,
 *  latest_chapter_num: The number of the latest chapter,
 *  cover_art: The filename of the cover art
 * }
 * No database updates take place in this function. If there is a cover art update, it will not be acknowledged until a new chapter is released.
 * @param {*} manga The manga object retrieved from the database of the manga to check for updates
 * @returns {Promise<*>} A manga object with fields for the latest chapter ID, latest chapter number, and latest cover art if there is a new chapter, otherwise null
 */
exports.checkForUpdates = async (manga) => {
  const headers = { 'User-Agent': config.get('USER_AGENT'), 'Referer': 'https://weebcentral.com' };
  const ret = await axios.get(`https://weebcentral.com/series/${manga.manga_id}`, { headers });
  if (ret.status !== 200) {
    if (ret.status >= 500) {
      throw new AigisError(`WeebCentral seems to be experiencing issues, please try again later.`);
    }
    throw new AigisError(`I could not find manga with ID ${manga.manga_id} on WeebCentral.`);
  }
  const $ = cheerio.load(ret.data);
  //get chapter data
  const chapter = $('#chapter-list').find('a').first();
  const chapterText = chapter.children().first().next().children().first().text();
  const latest_chapter_num = chapterText.split('Chapter ')[1] ?? 0;
  const latest_chapter = chapter.attr('href').split('chapters/')[1] ?? 0;
  if (parseFloat(latest_chapter_num) > parseFloat(manga.latest_chapter_num)) {
    let obj = {
      cover_art: manga.cover_art,
    };
    //update return object with new chapter data
    obj.latest_chapter = latest_chapter;
    obj.latest_chapter_num = latest_chapter_num;
    //check for cover art update if non-porn manga
    if (!manga.nsfw) {
      new_cover = await getCoverArt($);
      if (new_cover !== manga.cover_art) {
        obj.cover_art = new_cover; //update manga object to reflect new cover art for sending ping
      }
    }
    return obj;
  }
  return null;
}

/**
 * Generate the link for a chapter given the chapter ID
 * @param {String} chapter_id a Chapter ID
 * @returns {String} Link to the manga chapter
 */
exports.generateChapterLink = (chapter_id) => {
  return `https://weebcentral.com/chapters/${chapter_id}`;
}

/**
 * Generate the link for a manga given the manga ID
 * @param {String} manga_id a manga ID
 * @returns {String} Link to the manga
 */
exports.generateMangaLink = (manga_id) => {
  return `https://weebcentral.com/series/${manga_id}`;
}