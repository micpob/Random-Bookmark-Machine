let language = chrome.i18n.getUILanguage()
language = language.slice(0,2)

let months
switch (language) {
  case 'es':
    months = monthsLocalizations[language]
    break
  case 'it':
    months = monthsLocalizations[language]
    break
  case 'fr':
    months = monthsLocalizations[language]
    break
  case 'pt':
    months = monthsLocalizations[language]
    break
  default:
    months = monthsLocalizations['en']
    break
}

document.getElementById('extension_version').innerHTML = chrome.runtime.getManifest().version

const openInNewTabToggle = document.getElementById('open_in_new_tab_checkbox')
const openInNewTabToggleLabel = document.getElementById('open_in_new_tab_label')
const openInNewTabToggleLabelText = document.getElementById('open_in_new_tab_label_text')

//Options buttons
chrome.storage.sync.get('openInNewTab', (status) => {
  if (status.openInNewTab && status.openInNewTab === 'on') {
    openInNewTabToggleLabelText.innerText = 'ON'
    openInNewTabToggle.checked = true
  } else {
    openInNewTabToggleLabelText.innerText = 'OFF'
    openInNewTabToggle.checked = false
  }
})

openInNewTabToggle.addEventListener('change', (e) => {
    if (e.target.checked) {
      chrome.storage.sync.set({ 'openInNewTab': 'on' })  
      openInNewTabToggleLabelText.innerText = 'ON'
    } else {
      chrome.storage.sync.set({ 'openInNewTab': 'off' })  
      openInNewTabToggleLabelText.innerText = 'OFF'
    }
  }
)

const showInfoToggle = document.getElementById('show_info_checkbox')
const showInfoToggleLabel = document.getElementById('show_info_label')
const showInfoToggleLabelText = document.getElementById('show_info_label_text')

chrome.storage.sync.get('showInfo', (status) => {
  if (status.showInfo && status.showInfo === 'off') {
    showInfoToggleLabelText.innerText = 'OFF'
    showInfoToggle.checked = false
  } else {
    showInfoToggleLabelText.innerText = 'ON'
    showInfoToggle.checked = true
  }
})

showInfoToggle.addEventListener('change', (e) => {
    if (e.target.checked) {
      chrome.storage.sync.set({ 'showInfo': 'on' })  
      showInfoToggleLabelText.innerText = 'ON'
    } else {
      chrome.storage.sync.set({ 'showInfo': 'off' })  
      showInfoToggleLabelText.innerText = 'OFF'
    }
  }
)

const useShortcutToggle = document.getElementById('use_shortcut_checkbox')
const useShortcutToggleLabel = document.getElementById('use_shortcut_label')
const useShortcutToggleLabelText = document.getElementById('use_shortcut_label_text')

chrome.storage.sync.get('useShortcut', (status) => {
  if (status.useShortcut && status.useShortcut === 'on') {
    useShortcutToggleLabelText.innerText = 'ON'
    useShortcutToggle.checked = true
  } else {
    useShortcutToggleLabelText.innerText = 'OFF'
    useShortcutToggle.checked = false
  }
})

useShortcutToggle.addEventListener('change', (e) => {
    if (e.target.checked) {
      chrome.storage.sync.set({ 'useShortcut': 'on' })  
      useShortcutToggleLabelText.innerText = 'ON'
    } else {
      chrome.storage.sync.set({ 'useShortcut': 'off' })  
      useShortcutToggleLabelText.innerText = 'OFF'
    }
  }
)

//Set dates range
const startMonthsList = document.getElementById('start_month')
const startYearsList = document.getElementById('start_year')
const endMonthsList = document.getElementById('end_month')
const endYearsList = document.getElementById('end_year')

const date = new Date()
const currentMonth = date.getMonth()
const currentYear = date.getFullYear()

const startMonths = Array.from(startMonthsList.options)
  startMonths.map(option => { 
  option.innerHTML = months[option.value]
})
const endMonths = Array.from(endMonthsList.options)
  endMonths.map(option => { 
  option.innerHTML = months[option.value]
})

const yearsList = Array.from({ length: currentYear - 2007 }, (v, i) => currentYear - i)

for (let i = 0; i < yearsList.length; i++) {
  endYearsList.options.add(new Option(yearsList[i], yearsList[i]))
}

for(let i = yearsList.length-1; i >= 0; i--) {
  startYearsList.options.add(new Option(yearsList[i], yearsList[i]))
}

chrome.storage.sync.get(['dateRangeObject'], (dates) => {
  if (dates.dateRangeObject) {
    startMonthsList.selectedIndex = dates.dateRangeObject.startMonth
    startYearsList.value = dates.dateRangeObject.startYear
    const endMonth = dates.dateRangeObject.endMonth === '' ? currentMonth : dates.dateRangeObject.endMonth
    const endYear = dates.dateRangeObject.endYear.length > 0 ? dates.dateRangeObject.endYear : currentYear
    endMonthsList.selectedIndex = endMonth
    endYearsList.value = endYear
  } else {
    startMonthsList.selectedIndex = 0
    startYearsList.selectedIndex = 0
    endMonthsList.selectedIndex = currentMonth
    endYearsList.value = currentYear
  }   
})

Array.from(document.getElementsByTagName('select')).map(select => {
  select.addEventListener('change', storeDatesRange)
})

document.getElementById('set_to_start_button').addEventListener('click', (e) => {
  e.preventDefault()
  startMonthsList.selectedIndex = 0
  startYearsList.selectedIndex = 0
  storeDatesRange()
})

document.getElementById('set_to_now_button').addEventListener('click', (e) => {
  e.preventDefault()
  endMonthsList.selectedIndex = currentMonth
  endYearsList.value = currentYear
  storeDatesRange()
})

function storeDatesRange () {
  const date = new Date()
  const currentMonth = date.getMonth()
  const currentYear = date.getFullYear()
  const startMonth = startMonthsList.selectedIndex
  const startYear = startYearsList.value
  const endYear = currentYear == endYearsList.value ? '' : endYearsList.value
  let endMonth = endMonthsList.selectedIndex
  if (endYear.length < 1 && currentMonth == endMonth) {
    endMonth = ''
  }
  const dateRangeObject = {
    startMonth, startYear, endMonth, endYear
  }
  chrome.storage.sync.set({ dateRangeObject: dateRangeObject })      
}

//Filter folders
const checkAllBox = document.getElementById('check_all_checkbox')
const checkAllLabelText = document.getElementById('check_all_label_text')
let selectAllText = chrome.i18n.getMessage('select_all')
let deselectAllText = chrome.i18n.getMessage('deselect_all')

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
      checkAllLabelText.innerText = selectAllText
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
