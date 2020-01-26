const checkAllBox = document.getElementById('check_all_checkbox')
const checkAllLabelText = document.getElementById('check_all_label_text')
let selectAllText = 'Select All'
let deselectAllText = 'Deselect All'

checkAllBox.addEventListener('change', (e) => {
    let checkboxes = document.getElementsByClassName('folderName')  
    if (e.target.checked) {
      for (let i = 0; i < checkboxes.length; i++) {
        checkboxes[i].checked = true
      }
      checkAllLabelText.innerText = deselectAllText
    } else {
      for (let i = 0; i < checkboxes.length; i++) {
        checkboxes[i].checked = false
      }
      checkAllLabelText.innerText = 'Select All'
    }
    modifyFoldersList()
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
  const checkboxesChecked = checkboxes.filter(checkbox => checkbox.checked === true)
  checkboxesChecked.map(checkbox => { checkbox.parentElement.style.opacity = '1' })
  const checkboxesUnchecked = checkboxes.filter(checkbox => checkbox.checked === false)
  checkboxesUnchecked.length > 0 ? (checkAllBox.checked = false, checkAllLabelText.innerText = selectAllText) : (checkAllBox.checked = true, checkAllLabelText.innerText = deselectAllText)
  const folderToExcludeIds = checkboxesUnchecked.map(checkbox => { checkbox.parentElement.style.opacity = '0.5'; return checkbox.value })
  chrome.storage.sync.set({ excludedFolders: folderToExcludeIds })
}

function addElementsToList (bookmark) {  
  let checkbox = document.createElement("input")
  checkbox.type = "checkbox"
  checkbox.checked = true
  checkbox.name = bookmark.title
  checkbox.value = bookmark.id
  checkbox.id = 'checkbox' + bookmark.id
  checkbox.classList.add('folderName')
  checkbox.addEventListener('change', modifyFoldersList)

  chrome.storage.sync.get(['excludedFolders'], (folderList) => {
   if (folderList.excludedFolders && folderList.excludedFolders.includes(bookmark.id)) { 
     checkbox.checked = false
     checkbox.parentElement.style.opacity = '0.5'
     checkAllBox.checked = false
     checkAllLabelText.innerText = selectAllText
    }
  })  

  let label = document.createElement('label')
  label.id = bookmark.id
  label.htmlFor = 'checkbox' + bookmark.id
  let folderIcon = document.createElement('img')
  folderIcon.src = 'Res/Icons/folder.svg'

  if (bookmark.parentId != 0) {
    const parentFolder = document.getElementById(bookmark.parentId)
    const folderMargin = parentFolder.style.marginLeft == 0 ? '20px' : parseInt(parentFolder.style.marginLeft) + 20 + 'px'
    label.style.marginLeft = folderMargin
  }
  
  label.appendChild(folderIcon)
  label.appendChild(document.createTextNode(bookmark.title))
  label.appendChild(checkbox)

  document.getElementById('folders_list').appendChild(label)
}

chrome.bookmarks.getTree( process_bookmark )
