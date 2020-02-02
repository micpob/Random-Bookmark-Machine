let openInNewTab = false
let showBookmarkInfo = false
let notificationsTimeout = undefined
let startDate = 0
let endDate = 0

const bookmarkedUrlsArray = []
const parentFoldersObject = {}

let excludedFolders = []

let recursionCounter = 0

function process_bookmark (bookmarks) {

  recursionCounter++
  
  for (let i=0; i < bookmarks.length; i++) {    
    let bookmark = bookmarks[i]
    
    if (bookmark.url) {
      if (bookmark.dateAdded >= startDate && bookmark.dateAdded <= endDate && !excludedFolders.includes(bookmark.parentId)) {
        if (showBookmarkInfo) {
          const dateAdded = new Date(bookmark.dateAdded).toLocaleDateString('default', { year: 'numeric', month: 'long', day: 'numeric' })
          const folderId = bookmark.parentId
          const parentFolderTitle = parentFoldersObject[folderId]
          const urlObject = {
            url: bookmark.url,
            urlDate: dateAdded,
            urlParentFolder: parentFolderTitle
          } 
          bookmarkedUrlsArray.push(urlObject) 
        } else {
          urlObject = {
            url: bookmark.url
          } 
          bookmarkedUrlsArray.push(urlObject)
        }        
      }      
    }

    if (bookmark.children) {
      if (showBookmarkInfo) {
        const id = bookmark.id
        const title = bookmark.title
        parentFoldersObject[id] = title 
        }
      process_bookmark(bookmark.children)
    }
  }

  recursionCounter--

  if (recursionCounter === 0) {
    openBookmark()
  }
}

function openBookmark () {
  const bookmarkedUrlsArrayLength = bookmarkedUrlsArray.length
  if (bookmarkedUrlsArrayLength < 1) {
    chrome.runtime.openOptionsPage(() => { alert('No bookmarks in the selected folders and time range') })    
    return
  }
  const randomIndex = Math.floor(Math.random() * bookmarkedUrlsArrayLength)
  const randomUrlObject = bookmarkedUrlsArray[randomIndex]
  randomUrl = randomUrlObject.url
  console.log(randomUrl)
  if (openInNewTab) {
    chrome.tabs.create({ url: randomUrl })
  } else {
    chrome.tabs.update({ url: randomUrl })
  }
  //window.open(randomUrl, '_self')
  //window.location.href = randomUrl
  if (showBookmarkInfo) {
    chrome.notifications.clear('RandomBookmarkMachineInfo')
    chrome.notifications.create('RandomBookmarkMachineInfo', {   
      type: 'basic', 
      iconUrl: 'Res/Icons/icon48.png', 
      title: `Bookmarked on: ${randomUrlObject.urlDate} \nIn folder: ${randomUrlObject.urlParentFolder}`, 
      message: ``,
      priority: 1,
      silent: true 
      }, () => {
        if (typeof notificationsTimeout != "undefined") {
          clearTimeout(notificationsTimeout)        
        }
        notificationsTimeout = setTimeout(() => {
          chrome.notifications.clear('RandomBookmarkMachineInfo')
        }, 4000) 
      })
  }
  bookmarkedUrlsArray.length = 0
}

chrome.commands.onCommand.addListener(function (command) {
  if (command === "get_random_bookmark") {
    chrome.storage.sync.get('useShortcut', (status) => {
      console.log('status.useShortcut: ', status.useShortcut)
      
      if (status.useShortcut && status.useShortcut === 'on') {        
        getRandomBookmark()        
      }
    }) 
  }     
})

chrome.browserAction.onClicked.addListener( () => {
  getRandomBookmark()
})

function getRandomBookmark() {
  bookmarkedUrlsArray.length = 0
  chrome.storage.sync.get('openInNewTab', (status) => {
    if (status.openInNewTab && status.openInNewTab === 'on') {
      openInNewTab = true
    } else {
      openInNewTab = false
    }
    chrome.storage.sync.get('showInfo', (status) => {
      if (status.showInfo && status.showInfo === 'on') {
        showBookmarkInfo = true
      } else {
        showBookmarkInfo = false
      }
      chrome.storage.sync.get(['dateRangeObject'], (dates) => {
        startDate = new Date(`${dates.dateRangeObject.startMonth} 01 ${dates.dateRangeObject.startYear}`)
        startDate = startDate.getTime()
        endDate = new Date(`${dates.dateRangeObject.endMonth} 01 ${dates.dateRangeObject.endYear}`)
        endDate.setMonth(endDate.getMonth() + 1, 1)
        endDate = endDate.getTime()
        chrome.storage.sync.get(['excludedFolders'], (folderList) => {
          if (folderList.excludedFolders) {
            excludedFolders = folderList.excludedFolders
          }
          chrome.bookmarks.getTree( process_bookmark )
        }) 
      }) 
    })
  }) 
}