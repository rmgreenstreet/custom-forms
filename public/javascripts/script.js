window.onload = () => {
  
  //add drop shadow to navbar when page is scrolled
  $(window).scroll(() =>{     
    var scroll = $(window).scrollTop();
    if (scroll > 0) {
        $("nav").addClass("scrolled");
    }
    else {
        $("nav").removeClass("scrolled");
    }
  });

  //collapse navHamburger on item click
  $('.nav-link').click(() => {
      $('.navbar-collapse').collapse('hide');
  });
  
  //browser detection from MDN
  var sBrowser, sUsrAg = navigator.userAgent;

  // The order matters here, and this may report false positives for unlisted browsers.

  if (sUsrAg.indexOf("Firefox") > -1) {
    sBrowser = "Mozilla Firefox";
    // "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:61.0) Gecko/20100101 Firefox/61.0"
  } else if (sUsrAg.indexOf("SamsungBrowser") > -1) {
    sBrowser = "Samsung Internet";
    // "Mozilla/5.0 (Linux; Android 9; SAMSUNG SM-G955F Build/PPR1.180610.011) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/9.4 Chrome/67.0.3396.87 Mobile Safari/537.36
  } else if (sUsrAg.indexOf("Opera") > -1 || sUsrAg.indexOf("OPR") > -1) {
    sBrowser = "Opera";
    // "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.102 Safari/537.36 OPR/57.0.3098.106"
  } else if (sUsrAg.indexOf("Trident") > -1) {
    sBrowser = "Microsoft Internet Explorer";
    // "Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; .NET4.0C; .NET4.0E; Zoom 3.6.0; wbx 1.0.0; rv:11.0) like Gecko"
  } else if (sUsrAg.indexOf("Edge") > -1) {
    sBrowser = "Microsoft Edge";
    // "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36 Edge/16.16299"
  } else if (sUsrAg.indexOf("Chrome") > -1) {
    sBrowser = "Google Chrome or Chromium";
    // "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/66.0.3359.181 Chrome/66.0.3359.181 Safari/537.36"
  } else if (sUsrAg.indexOf("Safari") > -1) {
    sBrowser = "Apple Safari";
    // "Mozilla/5.0 (iPhone; CPU iPhone OS 11_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/11.0 Mobile/15E148 Safari/604.1 980x1306"
  } else {
    sBrowser = "unknown";
}

  //smooth scrolling using jquery for safari that doesn't support scroll-behavior:smooth in css
    
  if (sBrowser == 'Apple Safari' || sBrowser == 'Microsoft Internet Explorer') {
    $('a[href*="#"]').not('[href="#"]').not('[href="#0"]').click(function (t) {
      if (location.pathname.replace(/^\//, "") == this.pathname.replace(/^\//, "") && location.hostname == this.hostname) {
        const e = $(this.hash);
        e = e.length ? e : $("[name=" + this.hash.slice(1) + "]"), e.length && (t.preventDefault(), $("html, body").animate({
            scrollTop: e.offset().top
        }, 600, function () {
            const t = $(e);
            if (t.focus(), t.is(":focus")) return !1;
            t.attr("tabindex", "-1"), t.focus()
        }));
      }
    });
  }

}

//Show/hide "Expedite" button when showing "send invitation" form
function handleExpedited () {
  if (allLocations) {
    let selectedLocation = allLocations.find(location =>  location._id === document.getElementById('locationSelector').value);
    console.log(selectedLocation);
    for (let item of selectedLocation.expedited) {
      if (item.month == Date.now().getMonth() && item.year == Date.now().getFullYear && item.total >= 3) {
        if ($('#expediteCheckbox').is(':hidden')){
          $('#expediteCheckbox').toggle("slide",{},500);
        }
      } else if ($('#expediteCheckbox').is(':visible')){
          $('#expediteCheckbox').toggle("slide",{},500);
      }
    }
    let currentMonthExpedited = selectedLocation.expedited.find(item => item.month == Date.now().getMonth() && item.year == Date.now().getFullYear());
    $('#expeditedTotal').html(`This office has sent ${currentMonthExpedited} expedited requests this month`);
  };
};

function showOneHideOther(elementsToShow, elementsToHide) {
  for (var e of elementsToShow) {
    e.show();
  }
  for (var e of elementsToHide) {
    e.hide();
  }
};

var currentAdminsList = $('#currentAdmins');
var adminDropdownList = $('#adminDropdown');
var contactsEditButton = $('#contactsEdit');
var cancelContactsEdit = $('#cancelContactsEdit');

var currentPrimaryLocation = $('#currentPrimaryLocation');
var locationDropdownList = $('#locationDropdown');
var locationsEditButton = $('#locationsEdit');
var cancelLocationsEdit = $('#cancelLocationsEdit');

var updateButton = $('#updateCompany');

contactsEditButton.on('click', function () {
  showOneHideOther(
    [
      adminDropdownList, 
      cancelContactsEdit, 
      updateButton
    ], 
    [
      currentAdminsList, 
      contactsEditButton
    ]
  )
});
cancelContactsEdit.on('click', function () {
  showOneHideOther(
    [
      currentAdminsList, 
      contactsEditButton
    ], 
    [
      adminDropdownList, 
      cancelContactsEdit, 
      (cancelLocationsEdit.is(':hidden') ? updateButton : null)
    ]
  )
});

locationsEditButton.on('click', function () {
  showOneHideOther(
    [
      locationDropdownList, 
      cancelLocationsEdit, 
      updateButton
    ], 
    [
      currentPrimaryLocation, 
      locationsEditButton
    ]
  )
});
cancelLocationsEdit.on('click', function () {
  showOneHideOther(
    [
      currentPrimaryLocation, 
      locationsEditButton
    ], 
    [
      locationDropdownList, 
      cancelLocationsEdit, 
      (cancelContactsEdit.is(':hidden') ? updateButton : null)
    ]
  )
});


var showAddLocationButton = $('#showAddLocation');
var addLocationDiv = $('#addLocation');

showAddLocationButton.on('click', function() {
  if(addLocationDiv.is(':visible')) {
    this.textContent = 'Add Location';
  } else {
    this.textContent = 'Cancel';
  }
  addLocationDiv.toggle('slide');
});

var showCreateForm = $('#showCreateForm');
var createFormDiv = $('#createForm');

showCreateForm.on('click', function() {
  if(createFormDiv.is(':visible')) {
    this.textContent = 'Add A Form';
  } else {
    this.textContent = 'Cancel';
  }
  createFormDiv.toggle('slide');
});

//drag and drop functionality for form editor
// var _el;

// function dragOver(e) {
//   if (isBefore(_el, e.target))
//     e.target.parentNode.insertBefore(_el, e.target);
//   else
//     e.target.parentNode.insertBefore(_el, e.target.nextSibling);
// }

// function dragStart(e) {
//   e.dataTransfer.effectAllowed = "move";
//   e.dataTransfer.setData("text/plain", null); // Thanks to bqlou for their comment.
//   _el = e.target;
// }

// function isBefore(el1, el2) {
//   if (el2.parentNode === el1.parentNode)
//     for (var cur = el1.previousSibling; cur && cur.nodeType !== 9; cur = cur.previousSibling)
//       if (cur === el2)
//         return true;
//   return false;
// }