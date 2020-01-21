const bookmarkedUrlsArray = []

var recursionrecursionCounterer = 0

function process_bookmark (bookmarks) {
  recursionCounter++
  
  for (var i=0; i < bookmarks.length; i++) {
    
    var bookmark = bookmarks[i];
    if (bookmark.url) {
      bookmarkedUrlsArray.push(bookmark.url)
    }

    if (bookmark.children) {
      process_bookmark(bookmark.children);
    }
  }

  recursionCounter--

  if (recursionCounter === 0){
    openBookmark()
  }
}

function openBookmark () {
  const bookmarkedUrlsArrayLength = bookmarkedUrlsArray.length
  const randomIndex = Math.floor(Math.random() * bookmarkedUrlsArrayLength) + 1
  const randomUrl = bookmarkedUrlsArray[randomIndex]
  window.open(randomUrl)
  bookmarkedUrlsArray.length = 0
}

chrome.browserAction.onClicked.addListener( () => {
  chrome.bookmarks.getTree( process_bookmark )
})