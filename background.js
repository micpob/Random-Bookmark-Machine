const bookmarkedUrlsArray = []

let excludedFolders = []

let recursionCounter = 0

function process_bookmark (bookmarks) {

  recursionCounter++
  
  for (let i=0; i < bookmarks.length; i++) {    
    let bookmark = bookmarks[i]
    
    if (bookmark.url) {
      if (!excludedFolders.includes(bookmark.parentId))
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
  const randomIndex = Math.floor(Math.random() * bookmarkedUrlsArrayLength)
  const randomUrl = bookmarkedUrlsArray[randomIndex]
  /* console.log('bookmarkedUrlsArrayLength: ', bookmarkedUrlsArrayLength)
  console.log('randomIndex: ', randomIndex)
  console.log('randomUrl: ', randomUrl) */
  if (randomUrl) {
    window.open(randomUrl)
  } else {
    alert('Plase select at least one bookmarks folder from the list in the Options page')
  }
  
  bookmarkedUrlsArray.length = 0
}

chrome.browserAction.onClicked.addListener( () => {
  chrome.storage.sync.get(['excludedFolders'], (folderList) => {
    if (folderList.excludedFolders) {
      excludedFolders = folderList.excludedFolders
    }
    chrome.bookmarks.getTree( process_bookmark )
  }) 
  
})