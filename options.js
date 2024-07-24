let language = chrome.i18n.getUILanguage()
language = language.slice(0,2)

language = ['es', 'it', 'fr', 'pt', 'de', 'pl'].includes(language) ? language : 'en'

const monthsLocalizations = {
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  es: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
  it: ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'],
  fr: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
  pt: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
  de: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
  pl: ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień']
}

let months = monthsLocalizations[language]

document.getElementById('extension_version').innerHTML = chrome.runtime.getManifest().version

const openInNewTabToggle = document.getElementById('open_in_new_tab_checkbox')
const openInNewTabToggleLabel = document.getElementById('open_in_new_tab_label')
const openInNewTabToggleLabelText = document.getElementById('open_in_new_tab_label_text')

//Options buttons
chrome.storage.local.get('openInNewTab', (status) => {
  if (status.openInNewTab) {
    openInNewTabToggleLabelText.innerText = 'ON'
    openInNewTabToggle.checked = true
  } else {
    openInNewTabToggleLabelText.innerText = 'OFF'
    openInNewTabToggle.checked = false
  }
})

openInNewTabToggle.addEventListener('change', (e) => {
    if (e.target.checked) {
      chrome.storage.local.set({ 'openInNewTab': true })  
      openInNewTabToggleLabelText.innerText = 'ON'
    } else {
      chrome.storage.local.set({ 'openInNewTab': false })  
      openInNewTabToggleLabelText.innerText = 'OFF'
    }
  }
)

const showInfoToggle = document.getElementById('show_info_checkbox')
const showInfoToggleLabel = document.getElementById('show_info_label')
const showInfoToggleLabelText = document.getElementById('show_info_label_text')

chrome.storage.local.get('showInfo', (status) => {
  if (status.showInfo) {
    showInfoToggleLabelText.innerText = 'ON'
    showInfoToggle.checked = true
  } else {
    showInfoToggleLabelText.innerText = 'OFF'
    showInfoToggle.checked = false
  }
})

showInfoToggle.addEventListener('change', (e) => {
    if (e.target.checked) {
      chrome.storage.local.set({ 'showInfo': true })  
      showInfoToggleLabelText.innerText = 'ON'
    } else {
      chrome.storage.local.set({ 'showInfo': false })  
      showInfoToggleLabelText.innerText = 'OFF'
    }
  }
)

//open page to set keyboard shortcut
const setShortcutButton = document.getElementById('use_shortcut_button')
setShortcutButton.addEventListener('click', ()=> { chrome.tabs.create({ url: 'chrome://extensions/shortcuts' }) })

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

chrome.storage.local.get(['dateRangeObject'], (dates) => {
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
  select.addEventListener('change', () => { storeDatesRange() })
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

const storeDatesRange = () => {
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
  chrome.storage.local.set({ dateRangeObject: dateRangeObject })      
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

const process_bookmark = (bookmarks) => {  
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

const modifyFoldersList = () => {
  let checkboxes = document.getElementsByClassName('folderName')
  checkboxes = Array.from(checkboxes)
  const checkboxesChecked = checkboxes.filter(checkbox => checkbox.checked === true)
  checkboxesChecked.map(checkbox => { checkbox.parentElement.style.opacity = '1' })
  const checkboxesUnchecked = checkboxes.filter(checkbox => checkbox.checked === false)
  checkboxesUnchecked.length > 0 ? (checkAllBox.checked = false, checkAllLabelText.innerText = selectAllText) : (checkAllBox.checked = true, checkAllLabelText.innerText = deselectAllText)
  const folderToExcludeIds = checkboxesUnchecked.map(checkbox => { checkbox.parentElement.style.opacity = '0.5'; return checkbox.value })
  chrome.storage.local.set({ excludedFolders: folderToExcludeIds })
}

const addElementsToList = (bookmark) => {  
  let checkbox = document.createElement("input")
  checkbox.type = "checkbox"
  checkbox.checked = true
  checkbox.name = bookmark.title
  checkbox.value = bookmark.id
  checkbox.id = 'checkbox' + bookmark.id
  checkbox.classList.add('folderName')
  checkbox.addEventListener('change', () => { modifyFoldersList() })

  chrome.storage.local.get(['excludedFolders'], (folderList) => {
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

//refresh bookmarks list functionality
const refreshButtonTextLocalizations = {
  en: { processing: 'Processing', done: 'DONE!' },
  es: { processing: 'Procesando', done: 'HECHO!' },
  it: { processing: 'Processando', done: 'FINITO!' },
  fr: { processing: 'En cours', done: 'FAIT!' },
  pt: { processing: 'Processando', done: 'FEITO!' },
  de: { processing: 'Verarbeitung', done: 'FERTIG!' },
  pl: { processing: 'Przetwarzanie', done: 'ZROBIONE!' }
}
let refreshButtonText = refreshButtonTextLocalizations[language]

const refreshBookmarksListButton = document.getElementById('refresh_bookmarks_list_button')
const refreshButtonCaption = document.getElementById('refresh_button_caption')
refreshBookmarksListButton.addEventListener('click', ()=> { chrome.bookmarks.getTree( buildStorageBookmarksArray ) })

const buildStorageBookmarksArray = async (bookmarks) => {

  refreshBookmarksListButton.disabled = true
  refreshBookmarksListButton.style.backgroundColor = 'red'
  refreshButtonCaption.style.color = 'white'
  refreshBookmarksListButton.innerText = refreshButtonText.processing
  let arrayOfBookmarksLength = 0

  const recursiveEndChecker = setInterval( ()=> {

    refreshBookmarksListButton.style.color = refreshBookmarksListButton.style.color === 'white' ? 'transparent' : 'white'

    chrome.storage.local.get('allBookmarks', (result) => {
      const allBookmarks = result.allBookmarks

      if (allBookmarks.length === arrayOfBookmarksLength) {
        clearInterval(recursiveEndChecker)
        refreshBookmarksListButton.style.color = 'white'
        refreshBookmarksListButton.innerText = refreshButtonText.done
        refreshBookmarksListButton.style.backgroundColor = '#02a802'
        refreshButtonCaption.style.color = 'transparent'
        setTimeout(() => {
          location.reload()
          window.scrollTo(0, 9999);
        }, 1500);
      } else {
        arrayOfBookmarksLength = allBookmarks.length
      }
    }) 

  }, 1000)

  const allBookmarksArray = []

  const processBookmarks = (arrayOfBookmarks) => {

    if (arrayOfBookmarks.length < 1) { chrome.storage.local.set({allBookmarks: []}, () => { }) }

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
          chrome.storage.local.set({allBookmarks: allBookmarksArray}, () => { })
        })    
      }
  
      if (bookmark.children) {
        processBookmarks(bookmark.children)
      }
  
    }
  
  }

  processBookmarks(bookmarks)
}

chrome.bookmarks.getTree( process_bookmark )
