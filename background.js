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
          let openInNewTab = result.openInNewTab == 'on' ? true : false
          let showInfo = result.showInfo == 'off' ? false : true
          let useShortcut = result.useShortcut == 'on' ? true : false
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

  let arrayOfBookmarksLength = 0

  const recursiveEndChecker = setInterval( ()=> {
      if (allBookmarksArray.length === arrayOfBookmarksLength) {
        clearInterval(recursiveEndChecker)
        chrome.storage.local.set({allBookmarks: allBookmarksArray}, () => {  })
      } else {
        arrayOfBookmarksLength = allBookmarksArray.length
      }
  }, 250)

  const processBookmarks = (arrayOfBookmarks) => {

    for (let i=0; i < arrayOfBookmarks.length; i++) {   

      let bookmark = arrayOfBookmarks[i]
  
      if (bookmark.url) {
        chrome.bookmarks.getSubTree( bookmark.parentId, result => {
          const folderTitle = result[0].title
          const bookmarkObject = {
            id: bookmark.id,
            url: bookmark.url,
            urlDate: bookmark.dateAdded,
            parentFolderTitle: folderTitle,
            parentFolderId: bookmark.parentId
          } 
          allBookmarksArray.push(bookmarkObject)
          //chrome.storage.local.set({allBookmarks: allBookmarksArray}, () => {  })
        })    
      }
  
      if (bookmark.children) {
        processBookmarks(bookmark.children)
      }
  
    }
  
  }

  processBookmarks(bookmarks)
}

const openRandomBookmark = () => {
  chrome.storage.local.get('allBookmarks', (result) => {
    
    const allBookmarks = result.allBookmarks
    //console.log(allBookmarks)

    if (allBookmarks.length < 1) {
      noResults()
      return
    }
  
    chrome.storage.local.get(['openInNewTab', 'showInfo', 'dateRangeObject', 'excludedFolders'], (result) => {
      const openInNewTab = result.openInNewTab
      const showInfo = result.showInfo
      const dateRangeObject = result.dateRangeObject
      const excludedFolders = result.excludedFolders

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

      if (filteredBookmarks.length < 1) {
        noResults()
        return
      }

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

chrome.bookmarks.onChanged.addListener((changedBookmarkId, changeInfo) => {
  if (!changeInfo.url && changeInfo.title) {
    chrome.storage.local.get({allBookmarks: []}, (result) => {
      const oldArray = result.allBookmarks
      const newArray = oldArray.map(arrayObject => { 
        return arrayObject.parentFolderId === changedBookmarkId ? 
        {...arrayObject, parentFolderTitle: changeInfo.title} 
        :
        arrayObject
      })
      chrome.storage.local.set({allBookmarks: newArray})
    })
  } else if (changeInfo.url) {
    chrome.storage.local.get({allBookmarks: []}, (result) => {
      const allBookmarksArray = result.allBookmarks
      const targetIndex = allBookmarksArray.findIndex(bookmark => bookmark.id === changedBookmarkId)
      allBookmarksArray[targetIndex].url = changeInfo.url
      chrome.storage.local.set({allBookmarks: allBookmarksArray})
    })
  }
})

//chrome.bookmarks.onChildrenReordered.addListener(() => { chrome.bookmarks.getTree( buildStorageBookmarksArray ) })

chrome.bookmarks.onCreated.addListener((newBookmarkId, newBookmark) => { 

  if (!newBookmark.url) return

  chrome.storage.local.get({allBookmarks: []}, (result) => {
    const allBookmarksArray = result.allBookmarks
    chrome.bookmarks.getSubTree( newBookmark.parentId, result => {
      const folderTitle = result[0].title
      const bookmarkObject = {
        id: newBookmark.id,
        url: newBookmark.url,
        urlDate: newBookmark.dateAdded,
        parentFolderTitle: folderTitle,
        parentFolderId: newBookmark.parentId
      } 
      allBookmarksArray.push(bookmarkObject)
      chrome.storage.local.set({allBookmarks: allBookmarksArray})
    })
  })
 })

chrome.bookmarks.onImportBegan.addListener(() => { })

chrome.bookmarks.onImportEnded.addListener(() => { chrome.bookmarks.getTree( buildStorageBookmarksArray ) })

chrome.bookmarks.onMoved.addListener((movedBookmarkId, newBookmark) => { 
  //console.log('newBookmark.url:', newBookmark.url)
  if (newBookmark.oldParentId === newBookmark.parentId || !newBookmark.url) return
  chrome.storage.local.get({allBookmarks: []}, (result) => {
    const allBookmarksArray = result.allBookmarks
    const targetIndex = allBookmarksArray.findIndex(bookmark => bookmark.id === movedBookmarkId)
    chrome.bookmarks.getSubTree( newBookmark.parentId, result => {
      //console.log('result:', result)
      const folderTitle = result[0].title
      //console.log('newBookmark:', newBookmark)
      allBookmarksArray[targetIndex].parentFolderTitle = folderTitle
      allBookmarksArray[targetIndex].parentFolderId = newBookmark.parentId
      //console.log('moved bookmark:', allBookmarksArray[targetIndex])
      chrome.storage.local.set({allBookmarks: allBookmarksArray})
    })
  })  
})

chrome.bookmarks.onRemoved.addListener((removedBookmarkId, removeInfo) => { 
  if(removeInfo.node.children) { 
    const idsToRemove = removeInfo.node.children.map(url => url.id)
    chrome.storage.local.get({allBookmarks: []}, (result) => {
      const oldArray = result.allBookmarks
      const newArray = oldArray.filter(arrayObject => !idsToRemove.includes(arrayObject.id))
      chrome.storage.local.set({allBookmarks: newArray})
    })
  }
  if(removeInfo.node.url) { 
    chrome.storage.local.get({allBookmarks: []}, (result) => {
      const oldArray = result.allBookmarks
      const newArray = oldArray.filter(arrayObject => arrayObject.id !== removedBookmarkId)
      chrome.storage.local.set({allBookmarks: newArray})
    })
  }
})

const noResults = () => {
  chrome.runtime.openOptionsPage(() => { 
    const options = {
      type: 'basic',
      iconUrl: 'Res/Icons/icon48.png',
      title: '',
      message: chrome.i18n.getMessage('no_bookmarks_alert'),
      requireInteraction: true,
      priority: 2
    }
    chrome.notifications.create('noResultsNotification', options, () => {
      //chrome.notifications.onClosed.addListener(clearAllNotifications)
    })  
  })
}
