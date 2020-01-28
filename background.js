let startDate = 0
let endDate = 0

const bookmarkedUrlsArray = []

let excludedFolders = []

let recursionCounter = 0

function process_bookmark (bookmarks) {

  recursionCounter++
  
  for (let i=0; i < bookmarks.length; i++) {    
    let bookmark = bookmarks[i]
    
    if (bookmark.url) {
      if (bookmark.dateAdded >= startDate && bookmark.dateAdded <= endDate && !excludedFolders.includes(bookmark.parentId))
      bookmarkedUrlsArray.push(bookmark.url)
    }

    if (bookmark.children) {
      process_bookmark(bookmark.children)
    }
  }

  recursionCounter--

  if (recursionCounter === 0){
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
  const randomUrl = bookmarkedUrlsArray[randomIndex]
  window.open(randomUrl)  
  bookmarkedUrlsArray.length = 0
}

chrome.browserAction.onClicked.addListener( () => {
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