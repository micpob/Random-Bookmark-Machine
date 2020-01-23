const checkAllBox = document.getElementById('check_all')

checkAllBox.addEventListener('change', (e) => {
    let checkboxes = document.getElementsByClassName('folderName')  
    if (e.target.checked) {
      for (let i = 0; i < checkboxes.length; i++) {
        checkboxes[i].checked = true
      }
    } else {
      for (let i = 0; i < checkboxes.length; i++) {
        checkboxes[i].checked = false
      }
    }
  }
)

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
  checkboxesUnchecked.length > 0 ? checkAllBox.checked = false : checkAllBox.checked = true
  const folderToExcludeIds = checkboxesUnchecked.map(checkbox => { return checkbox.value })
  chrome.storage.sync.set({ excludedFolders: folderToExcludeIds })
}

function addElementsToList (bookmark) {  
  let checkbox = document.createElement("input")
  checkbox.type = "checkbox"
  checkbox.checked = true
  checkbox.name = bookmark.title
  checkbox.value = bookmark.id
  checkbox.id = bookmark.id
  checkbox.classList.add('folderName')

  checkbox.setAttribute('data-parentfolder', bookmark.parentId)

  if (bookmark.parentId != 0) {
    const parentFolder = document.getElementById(bookmark.parentId)
    const folderMargin = parentFolder.style.marginLeft == 0 ? '20px' : parseInt(parentFolder.style.marginLeft) + 20 + 'px'
    checkbox.style.marginLeft = folderMargin
  }

  checkbox.addEventListener('change', (event) => {
    modifyFoldersList()
  })
  chrome.storage.sync.get(['excludedFolders'], (folderList) => {
   if (folderList.excludedFolders && folderList.excludedFolders.includes(bookmark.id)) { 
     checkbox.checked = false
     checkAllBox.checked = false
    }
  })  

  let label = document.createElement('label')
  label.htmlFor = bookmark.id
  let folderIcon = document.createElement('img')
  folderIcon.src = 'Res/Icons/folder4b.svg'
  folderIcon.style.height = '20px'
  //folderIcon.style.width = folderIcon.style.height
  label.appendChild(checkbox)
  label.appendChild(folderIcon)
  label.appendChild(document.createTextNode(bookmark.title))
  

  document.getElementById('folders_list').appendChild(label)
  //document.getElementById('folders_list').appendChild(checkbox)  
  document.getElementById('folders_list').appendChild(document.createElement('br'))    
  document.getElementById('folders_list').appendChild(document.createElement('br')) 
}

chrome.bookmarks.getTree( process_bookmark )
