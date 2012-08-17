/*
"Copy as HTML Link", a Firefox Extension

This code draws heavily upon the Copy Plain Text 0.3.2 extension 
written by Jeremy Gillick: http://mozmonkey.com/ Used with permission.

Copyright (C) 2009 Justin Watt

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
    var str = copy_as_html_link_getSelection() + "";
    var url = document.commandDispatcher.focusedWindow.location.href;
    
    // if no text was selected, but we're clicking on a link...
    if (str != null && str.length == 0 && gContextMenu && gContextMenu.onLink && !gContextMenu.onMailtoLink) {
      str = gContextMenu.linkText();
      url = gContextMenu.linkURL;
    }
    
    // remove newlines, compact duplicate spaces, and trim
    str = str.replace(/[\n\r]/g, " ");
    str = str.replace(/\s+/g, " ");
    str = str.replace(/^\s*|\s*$/g, "");
    
    // escape characters with special html meaning
    str = str.replace(/&/g, "&amp;");
    str = str.replace(/</g, "&lt;");
    str = str.replace(/>/g, "&gt;");

    // escape ampersands in url (for use as html)
    url = url.replace(/&/g, "&amp;");

    // copy
    if (str != null && str.length > 0) {
      
      // build link
      str = "<a href=\"" + url + "\">" + str + "</a>";
      
      // copy to clipboard
      var clipboard = Components.classes["@mozilla.org/widget/clipboardhelper;1"].getService(Components.interfaces.nsIClipboardHelper);
      clipboard.copyString(str);
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
