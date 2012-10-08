/*
"Copy as HTML Link", a Firefox Extension

This code draws heavily upon the Copy Plain Text 0.3.2 extension 
written by Jeremy Gillick: http://mozmonkey.com/ Used with permission.

Copyright (C) 2012 Justin Watt

This program is free software; you can redistribute it and/or
modify it under the terms of the GNU General Public License
as published by the Free Software Foundation; either version 2
of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program; if not, write to the Free Software
Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
*/


function copy_as_html_link()
{
  try
  {
    // get selected text and location of the current page
    var link_text = copy_as_html_link_getSelection() + "";
    var link_url = document.commandDispatcher.focusedWindow.location.href;
    
    // if no text was selected, but we're clicking on a link...
    if (link_text != null && link_text.length == 0 && gContextMenu && gContextMenu.onLink && !gContextMenu.onMailtoLink) {
      link_text = gContextMenu.linkText();
      link_url = gContextMenu.linkURL;
    }
    
    // remove newlines, compact duplicate spaces, and trim
    link_text = link_text.replace(/[\n\r]/g, " ");
    link_text = link_text.replace(/\s+/g, " ");
    link_text = link_text.replace(/^\s*|\s*$/g, "");
    
    // escape characters with special html meaning
    link_text = link_text.replace(/&/g, "&amp;");
    link_text = link_text.replace(/</g, "&lt;");
    link_text = link_text.replace(/>/g, "&gt;");

    // escape ampersands in url (for use as html)
    link_url = link_url.replace(/&/g, "&amp;");

    // copy
    if (link_text != null && link_text.length > 0) {
      
      // build link
      html_link = "<a href=\"" + link_url + "\">" + link_text + "</a>";
      
      // copy to clipboard in both unicode and html flavors
      // see: https://developer.mozilla.org/en-US/docs/Using_the_Clipboard
      var str = Components.classes["@mozilla.org/supports-string;1"].
      createInstance(Components.interfaces.nsISupportsString);
      if (!str) return false;
      str.data = html_link;
       
      var trans = Components.classes["@mozilla.org/widget/transferable;1"].
      createInstance(Components.interfaces.nsITransferable);
      if (!trans) return false;

      // init() was added to nsITransferable in FF16 for Private Browsing Mode
      // see https://bugzilla.mozilla.org/show_bug.cgi?id=722872 for more info
      // adding typeof checking to ensure backwards compatibility
      if (typeof trans.init === 'function') {
        trans.init(null);
      }
       
      trans.addDataFlavor("text/unicode");
      trans.setTransferData("text/unicode", str, html_link.length * 2);
      trans.addDataFlavor("text/html");
      trans.setTransferData("text/html", str, html_link.length * 2);
       
      var clipid = Components.interfaces.nsIClipboard;
      var clip = Components.classes["@mozilla.org/widget/clipboard;1"].getService(clipid);
      if (!clip) return false;
       
      clip.setData(trans, null, clipid.kGlobalClipboard);
    }
  }
  catch(err)
  { 
    alert("An unknown error occurred\n" + err);
  }
}

function copy_as_html_link_init()
{
  var menu = document.getElementById("contentAreaContextMenu");
  menu.addEventListener('popupshowing', copy_as_html_link_showContextMenu, false);
}

function copy_as_html_link_showMenu()
{
  try
  {    
    // is text selected?
    var str = copy_as_html_link_getSelection();
    if (str != null && str.length > 0) {
      return true;
    }
    
    // or are we clicking on a link (but not mailto)
    if (gContextMenu && (gContextMenu.onLink && !gContextMenu.onMailtoLink)) {
      return true;
    }

  }
  catch(err) { }
  
  return false;
}

function copy_as_html_link_getSelection()
{
  var focusedWindow = document.commandDispatcher.focusedWindow;
  var str = focusedWindow.getSelection.call(focusedWindow);
  str = str.toString();
  
  return str;
}

function copy_as_html_link_showEditMenu()
{
  if (document.getElementById('copy_as_html_link-edit-menu') != null) {
    document.getElementById('copy_as_html_link-edit-menu').setAttribute("disabled", !copy_as_html_link_showMenu());
  }
}

function copy_as_html_link_showContextMenu()
{
  if (document.getElementById('copy_as_html_link-context-menu') != null) {
    document.getElementById('copy_as_html_link-context-menu').setAttribute("collapsed", !copy_as_html_link_showMenu());
  }
}
