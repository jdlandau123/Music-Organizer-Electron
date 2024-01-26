const fs = require('fs');
const path = require('path');
const { Op } = require("sequelize");

const basepath = 'C://ProgramData/Music_Organizer'; // windows
// const basepath = '/opt/Music_Organizer'; // linux

function checkConfig() {
    if (fs.existsSync(`${basepath}/config.json`)) {
        const config = JSON.parse(fs.readFileSync(`${basepath}/config.json`, 'utf8'));
        return config;
    } else {
        return null;
    }
}

function saveConfig(config) {
    fs.writeFile(`${basepath}/config.json`, JSON.stringify(config), 'utf8', (err) => console.log(err));
}

async function queryCollection(albumModel, searchObj) {
    try {
        const results = await albumModel.findAll({
            where: {
                [Op.or]: [
                    {artist: {[Op.like]: `%${searchObj.search}%`}},
                    {album: {[Op.like]: `%${searchObj.search}%`}}
                ]
            },
            order: [searchObj.order]
        })
        return results.map(r => r.dataValues);
    } catch(e) {
        console.log('ERROR: ' + e);
    }
}

function syncMusicCollection(albumModel) {
    const config = JSON.parse(fs.readFileSync(`${basepath}/config.json`, 'utf8'));
    if (!fs.existsSync(config.collectionPath)) {
        return {status: 'error', message: 'Music Collection Not Found'}
    }
    let totalAlbums = 0;
    fs.readdirSync(config.collectionPath).forEach(artist => {
        const artistPath = path.join(config.collectionPath, artist);
        fs.readdirSync(artistPath).forEach(async album => {
            const albumPath = path.join(artistPath, album);
            totalAlbums++;
            let tracks = {};
            let fileFormat = null;
            let trackNum = 1;
            fs.readdirSync(albumPath).forEach(song => {
                if (!fileFormat) fileFormat = path.extname(path.join(albumPath, song)).substring(1).toUpperCase();
                tracks[trackNum] = song;
                trackNum++;
            })
            try {
                const existingAlbum = await albumModel.findOne({
                    where: {album, artist}
                })
                if (existingAlbum?.id) {
                    existingAlbum.fileFormat = fileFormat;
                    existingAlbum.tracklist = tracks;
                    await existingAlbum.save();
                } else {
                    await albumModel.create({artist, album, fileFormat, isOnDevice: false, tracklist: tracks});
                }
            } catch(e) {
                console.log('ERROR: ' + e);
                return {status: 'error', message: 'Error syncing with music collection'};
            }
        })
    })
    return {status: 'success', message: 'Database Synced'}
}

async function syncDevice(albumModel, albumIdsToSync) {
    const config = JSON.parse(fs.readFileSync(`${basepath}/config.json`, 'utf8'));
    if (!fs.existsSync(config.devicePath)) {
        return {status: 'error', message: 'Device Not Found'}
    }
    if (!fs.existsSync(config.collectionPath)) {
        return {status: 'error', message: 'Music Collection Not Found'}
    }
    try {
        const albumsToAdd = await albumModel.findAll({
            where: {
                [Op.and]: [ // add albums that are not already on the device and in the array
                    {id: {[Op.in]: albumIdsToSync}},
                    {isOnDevice: false}
                ]
            }
        })
        const albumsToRemove = await albumModel.findAll({
            where: {
                [Op.and]: [ // remove albums that were not in the array and are on the device
                    {id: {[Op.notIn]: albumIdsToSync}},
                    {isOnDevice: true}
                ]
            }
        })
        albumsToAdd.forEach(async album => {
            const albumDir = `${config.collectionPath}/${album.artist}/${album.album}`;
            const destination = `${config.devicePath}/${album.artist}/${album.album}`;
            fs.cpSync(albumDir, destination, {
                recursive: true,
            });
            album.isOnDevice = true;
            await album.save({fields: ['isOnDevice']});
        })
        albumsToRemove.forEach(async album => {
            fs.rmSync(`${config.devicePath}/${album.artist}/${album.album}`, { recursive: true });
            album.isOnDevice = false;
            await album.save({fields: ['isOnDevice']});
        })
    } catch(e) {
        console.log('ERROR: ' + e);
        return {status: 'error', message: 'Error syncing device'};
    }
    fs.readdirSync(config.devicePath).forEach(artist => {
        const artistPath = path.join(config.devicePath, artist);
        if (fs.lstatSync(artistPath).isDirectory() && fs.readdirSync(artistPath).length === 0) {
            fs.rmSync(artistPath, { recursive: true }); // clean up empty artist folders
        }
    })
    return {status: 'success', message: 'Device Synced'}
}


function scanDevice(albumModel) {
    const config = JSON.parse(fs.readFileSync(`${basepath}/config.json`, 'utf8'));
    if (!fs.existsSync(config.devicePath)) {
        return {status: 'error', message: 'Device Not Found'}
    }
    fs.readdirSync(config.devicePath).forEach(artist => {
        const artistPath = path.join(config.devicePath, artist);
        if (fs.lstatSync(artistPath).isDirectory(artistPath)) {
            fs.readdirSync(artistPath).forEach(async album => {
                try {
                    const a = await albumModel.findOne({
                        where: {artist, album}
                    })
                    a.isOnDevice = true;
                    a.save({fields: ['isOnDevice']});
                } catch (err) {
                    console.log(err);
                    return {status: 'error', message: 'Error Scanning Device'};
                }
            })
        }
    })
    return {status: 'success', message: 'Database Synced'}
}

module.exports = {
    checkConfig,
    saveConfig,
    queryCollection,
    syncMusicCollection,
    syncDevice,
    scanDevice
}
