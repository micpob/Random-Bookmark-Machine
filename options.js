function process_bookmark (bookmarks) {  
  for (let i=0; i < bookmarks.length; i++) {
    
    let bookmark = bookmarks[i];

    if (bookmark.children) {
      if (bookmark.title.length > 0) {
        addElementsToList(bookmark)
      }
      process_bookmark(bookmark.children)
    }
  }
}

function modifyFoldersList () {
  let checkboxes = document.getElementsByClassName('folderName')
  checkboxes = Array.from(checkboxes) 
  const checkboxesUnchecked = checkboxes.filter(checkbox => checkbox.checked === false)
  const folderToExcludeIds = checkboxesUnchecked.map(checkbox => { return checkbox.value })
  chrome.storage.sync.set({ excludedFolders: folderToExcludeIds })
}

function addElementsToList (bookmark) {  
  let checkbox = document.createElement("input")
  checkbox.type = "checkbox"
  checkbox.checked = true
  checkbox.name = bookmark.title
  checkbox.value = bookmark.id
  checkbox.id = bookmark.title
  checkbox.classList.add('folderName')
  checkbox.addEventListener('change', (event) => {
    modifyFoldersList()
  })
  chrome.storage.sync.get(['excludedFolders'], (folderList) => {
   if (folderList.excludedFolders && folderList.excludedFolders.includes(bookmark.id)) { checkbox.checked = false }
  })  
  let label = document.createElement('label')
  label.htmlFor = bookmark.title
  label.appendChild(document.createTextNode(bookmark.title))
  document.getElementById('folders_list').appendChild(checkbox)
  document.getElementById('folders_list').appendChild(label)
  document.getElementById('folders_list').appendChild(document.createElement('br'))    
}

chrome.bookmarks.getTree( process_bookmark )
