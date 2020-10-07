const { app, Menu, Tray, shell } = require('electron'),
      request = require('request'),
      wallpaper = require('wallpaper'),
      AutoLaunch = require('auto-launch'),
      fs = require('fs'),
      path = require('path');

let autoLaunch = new AutoLaunch({
	name: 'Bing - Daily Wallpapers',
	isHidden: true
});

if (app.isPackaged) {
  autoLaunch.enable()
}

Array.prototype.random = function(length = 1) {
  if (length == 1) return this.sort(() => Math.random() - Math.random())[0]
  return this.sort(() => Math.random() - Math.random()).slice(length);
}

let tray = null;
app.whenReady().then(async () => {
  request('https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=7&mkt=en-US', (err, res, body) => {
    if (err) throw err;
    body = JSON.parse(body);
    const link = 'https://www.bing.com/' + body.images[0].url;

    sendRequest(link)
  })

  tray = new Tray(path.join(app.getAppPath(), 'assets', 'bing.ico'));

  const contextMenu = Menu.buildFromTemplate([
    {
      id: 'connectInfo',
      label: 'Change Wallpaper',
      click: changeWallpaper
    },
    {
      label: `Quit`,
      role: 'quit',
    },
    { type: 'separator' },
    {
      id: 'credits',
      label: 'Made with ❤️ by ardasoyturk',
      click: () => shell.openExternal('https://github.com/ardasoyturk'),
    },
  ]);
  tray.setToolTip('Bing - Daily Wallpapers');
  tray.setContextMenu(contextMenu);

  tray.on('click', changeWallpaper)
});

app.once('quit', () => tray.destroy());

// Functions

function changeWallpaper() {
  request('https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=15&mkt=en-US', (err, res, body) => {
    if (err) throw err;
    body = JSON.parse(body);
    const link = 'https://www.bing.com/' + body.images.random().url;
    sendRequest(link)
  })
}

function sendRequest(link) {
  request(link, { encoding: null }, (err, res, body) => {
    fs.writeFile(app.getAppPath() + '/assets/wallpaper.jpg', body, (err) => {
      if (err) throw err;
      wallpaper.set(app.getAppPath() + '/assets/wallpaper.jpg')
    })
  })
}