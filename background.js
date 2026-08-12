/**
 * Chrome extension for inserting Task Title Snippets
 * Made with assistance from Gemeni AI 
 * 
 */

// 1. Data lists for the menus
const VFMenu = [
    "Vehicle failure // Rejection / Buyback",
    "Vehicle failure // Final Technical solution",
    "Vehicle Failure // Commercial Goodwill",
    "Vehicle Failure // Technical Goodwill",
    "Vehicle Failure // Goodwill - No Matrix",
    "Vehicle Failure // Goodwill - Customer eligible but no CC-2 raised",
    "Vehicle Failure // Goodwill - Incorrect Dealer Referral",
    "Vehicle failure // Warranty application",
    "Vehicle Failure // Mobility – CC Provided",
    "Vehicle Failure // Mobility – No CC Available",
    "Vehicle Failure // Mobility - Extension ",
    "Vehicle Failure // Mobility – No CC nor Rental Available",
    "Vehicle Failure // Mobility – Vehicle Repaired – No CC Provided",
    "Vehicle Failure // Mobility – Payment Requested",
    "Vehicle Failure RAC // Mobility – No Extension Possible",
    "Vehicle Failure // Mobility – No extension possible",
    "Vehicle failure // Mobility - Reimbursement",
    "Vehicle failure // Rejection / Vehicle replacement",
    "Vehicle failure // Service contract application",
    "Vehicle failure // Explanation",
    "Vehicle failure // Towing"
]; 

const VDDMenu = [
    "Vehicle delivery delay // Rejection / Buyback",
    "Vehicle delivery delay // Goodwill",
    "Vehicle delivery delay // Mobility - Extension",
    "Vehicle delivery delay // Mobility - Vehicle type",
    "Vehicle delivery delay // Mobility - Reimbursement",
    "Vehicle delivery delay // Rejection / Vehicle replacement",
    "Vehicle delivery delay // Service contract application",
    "Vehicle delivery delay // Explanation"
]; 

// 2. Centralized map to store ID-to-Text relationships for the click handler
const textLookupMap = {};

// 3. Register menus and submenus on installation
chrome.runtime.onInstalled.addListener(() => {
  const targetContexts = ["editable"];

  // ==================== FIRST MENU ====================
  const menu1Id = "vfMenu";
  chrome.contextMenus.create({
    id: menu1Id,
    title: "Vehicle Failure Case",
    contexts: targetContexts
  });

  // Loop for the first menu
  firstMenu.forEach((text) => {
    // Generates an ID like "m1_etc_etc"
    const uniqueId = "m1_" + text.toLowerCase().replace(/[^a-z0-9]/g, "_");
    
    textLookupMap[uniqueId] = text;

    chrome.contextMenus.create({
      id: uniqueId,
      parentId: menu1Id,
      title: text,
      contexts: targetContexts
    });
  });
  // ------------------------------------
 
  
  
});

 // ==================== CORE LOGIC ====================

// 4. Handle menu selection and text injection
chrome.contextMenus.onClicked.addListener((info, tab) => {
  const textToInsert = textLookupMap[info.menuItemId];

  if (!textToInsert) return;

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    //func: insertTextIntoField,
    func: insertAndReplaceTextField,
    args: [textToInsert]
  });
});

/** 
// 5. Code injected directly into the active browser field
function insertTextIntoField(text) {
  const activeElement = document.activeElement;
  
  if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA' || activeElement.isContentEditable)) {
    if (activeElement.isContentEditable) {
      activeElement.innerText = text;
    } else {
      activeElement.value = text;
    }
    // Triggers input events for frameworks like React, Angular, or Vue
    activeElement.dispatchEvent(new Event('input', { bubbles: true }));
  }
 */
// 5. Improved injection function running in the webpage context
function insertAndReplaceTextField(text) {
  const activeElement = document.activeElement;
  
  if (!activeElement) return;

  const isStandardInput = activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA';
  const isContentEditable = activeElement.isContentEditable;

  if (isStandardInput || isContentEditable) {
    // Step 1: Force focus on the element
    activeElement.focus();

    // Step 2: Select all existing text and update the value
    if (isStandardInput) {
      activeElement.select(); // Visual selection fallback
      activeElement.value = text;
    } else if (isContentEditable) {
      // Clear visual range selection for rich text editors
      const range = document.createRange();
      range.selectNodeContents(activeElement);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      
      activeElement.innerText = text;
    }

    // Step 3: Trigger change events so web apps (React/Vue/Angular) register the update
    activeElement.dispatchEvent(new Event('input', { bubbles: true }));
    activeElement.dispatchEvent(new Event('change', { bubbles: true }));
  }

}
