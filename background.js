chrome.runtime.onInstalled.addListener((details) => {
  const reason = details.reason

  switch (reason) {
     case 'install':
        chrome.storage.local.set({
          "excludedFolders": [],
          "openInNewTab": false,
          "allBookmarks": [],
          "showInfo": true,
          "useShortcut": false,
          "dateRangeObject": {"endMonth" : "", "endYear" : "", "startMonth" : 0, "startYear" : "2008"}
        }, () => {
          chrome.bookmarks.getTree( buildStorageBookmarksArray )
        })
        break;
     case 'update':
        chrome.storage.sync.get(['excludedFolders', 'openInNewTab', 'allBookmarks', 'showInfo', 'useShortcut', 'dateRangeObject'], (result) => {
          let allBookmarks = result.allBookmarks ? result.allBookmarks : []
          let excludedFolders = result.excludedFolders ? result.excludedFolders : []
          let openInNewTab = result.openInNewTab ? result.openInNewTab : false
          let showInfo = result.showInfo ? result.showInfo : true
          let useShortcut = result.useShortcut ? result.useShortcut : false
          let dateRangeObject = result.dateRangeObject ? result.dateRangeObject : {"endMonth" : "", "endYear" : "", "startMonth" : 0, "startYear" : "2008"}
          chrome.storage.local.set({
            "allBookmarks": allBookmarks,
            "excludedFolders": excludedFolders,
            "openInNewTab": openInNewTab,
            "showInfo": showInfo,
            "useShortcut": useShortcut,
            "dateRangeObject": dateRangeObject
          }, () => {
            chrome.bookmarks.getTree( buildStorageBookmarksArray )
          })
        })
        break;
     case 'chrome_update':
        break;
     case 'shared_module_update':
        break;
     default:
        
        break;
  }

})



const buildStorageBookmarksArray = async (bookmarks) => {

  const allBookmarksArray = []

  //let recursionCounter = 0

  const processBookmarks = (arrayOfBookmarks) => {
    //recursionCounter++

    for (let i=0; i < arrayOfBookmarks.length; i++) {   

      let bookmark = arrayOfBookmarks[i]
  
      console.log('processing bookmarks...')
      //console.log('recursion counter:', recursionCounter)
      //console.log('allBookmarksArray:', allBookmarksArray)
      
      if (bookmark.url) {
        console.log('bookmark:', bookmark)
        //const dateAdded = new Date(bookmark.dateAdded).toLocaleDateString('default', { year: 'numeric', month: 'long', day: 'numeric' })
        chrome.bookmarks.getSubTree( bookmark.parentId, result => {
          const folderTitle = result[0].title
          const bookmarkObject = {
            url: bookmark.url,
            urlDate: bookmark.dateAdded,
            parentFolderTitle: folderTitle,
            parentFolderId: bookmark.parentId
          } 
          allBookmarksArray.push(bookmarkObject)
          chrome.storage.local.set({allBookmarks: allBookmarksArray}, () => {  });
        })    
      }
  
      if (bookmark.children) {
        processBookmarks(bookmark.children)
      }
  
    }
  
    //recursionCounter--
  }

  /* if (recursionCounter === 0) {
    chrome.storage.local.get({allBookmarks: []}, (result) => {
      var allBookmarks = allBookmarksArray;
      chrome.storage.local.set({allBookmarks: allBookmarks}, () => {
      });
    });
  } */

  processBookmarks(bookmarks)
}

const openRandomBookmark = () => {
  chrome.storage.local.get('allBookmarks', (result) => {
    
    const allBookmarks = result.allBookmarks
    console.log(allBookmarks)

    if (allBookmarks.length < 1) {
      const alertMessage = chrome.i18n.getMessage('no_bookmarks_alert') 
      chrome.runtime.openOptionsPage(() => { /* NOT WORKING ANYMORE IN v3 alert(alertMessage) */ })    
      return
    }
  
    chrome.storage.local.get(['openInNewTab', 'showInfo', 'dateRangeObject', 'excludedFolders'], (result) => {
      const openInNewTab = result.openInNewTab
      const showInfo = result.showInfo
      const dateRangeObject = result.dateRangeObject
      const excludedFolders = result.excludedFolders

      //console.log(openInNewTab, showInfo, dateRangeObject, excludedFolders)

      let startDate = new Date(`${dateRangeObject.startMonth + 1} 01 ${dateRangeObject.startYear}`)
      startDate = startDate.getTime()
      let endMonth
      let endYear
      if (dateRangeObject.endMonth.length < 1) {
        const date = new Date()
        endMonth = date.getMonth()
        endYear = date.getFullYear()
      } else {
        const date = new Date()
        endMonth = dateRangeObject.endMonth
        endYear = dateRangeObject.endYear.length < 1 ? date.getFullYear() : dateRangeObject.endYear 
      }
      let endDate = new Date(`${endMonth + 1} 01 ${endYear}`)
      endDate.setMonth(endDate.getMonth() + 1, 1)
      endDate = endDate.getTime()

      const filteredBookmarks = allBookmarks.filter( bookmark => !excludedFolders.includes(bookmark.parentFolderId) && bookmark.urlDate >= startDate && bookmark.urlDate <= endDate )

      //console.log('filteredBookmarks:', filteredBookmarks)

      const randomIndex = Math.floor(Math.random() * filteredBookmarks.length)
      const randomUrlObject = filteredBookmarks[randomIndex]
      const randomUrl = randomUrlObject.url
      if (openInNewTab) {
        chrome.tabs.create({ url: randomUrl })
      } else {
        chrome.tabs.update({ url: randomUrl })
      }
      if (showInfo) {
        const dateAdded = new Date(randomUrlObject.urlDate).toLocaleDateString('default', { year: 'numeric', month: 'long', day: 'numeric' })
        const bookmarkedOn = chrome.i18n.getMessage('bookmarked_on_date') 
        const inFolder = chrome.i18n.getMessage('saved_in_folder') 
        chrome.notifications.clear('RandomBookmarkMachineInfo')
        chrome.notifications.create('RandomBookmarkMachineInfo', {   
          type: 'basic', 
          iconUrl: 'Res/Icons/icon48.png', 
          title: `${bookmarkedOn} ${dateAdded} \n${inFolder} ${randomUrlObject.parentFolderTitle}`, 
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
    
    })
  })
}

chrome.action.onClicked.addListener(() => { openRandomBookmark() })

chrome.bookmarks.onChanged.addListener(() => { chrome.bookmarks.getTree( buildStorageBookmarksArray ) })
chrome.bookmarks.onChildrenReordered.addListener(() => { chrome.bookmarks.getTree( buildStorageBookmarksArray ) })
chrome.bookmarks.onCreated.addListener(() => { chrome.bookmarks.getTree( buildStorageBookmarksArray ) })
chrome.bookmarks.onImportEnded.addListener(() => { chrome.bookmarks.getTree( buildStorageBookmarksArray ) })
chrome.bookmarks.onMoved.addListener(() => { chrome.bookmarks.getTree( buildStorageBookmarksArray ) })
chrome.bookmarks.onRemoved.addListener(() => { chrome.bookmarks.getTree( buildStorageBookmarksArray ) })

//TODO: fix keyboard shortcut for v3
chrome.commands.onCommand.addListener( (command) => {
  console.log(command)
  if (command === "get_random_bookmark") {
    chrome.storage.sync.get('useShortcut', (result) => {
      if (result.useShortcut) {        
        openRandomBookmark()        
      }
    }) 
  }     
})
