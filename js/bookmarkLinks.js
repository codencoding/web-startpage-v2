let inputTempLinkValueElem = document.getElementById('inputTempLinkValue');
let inputTempLinkHrefElem = document.getElementById('inputTempLinkHref');
let inputTempLinkColElem = document.getElementById('inputTempLinkCol');
let btnTempLinkSubmitElem = document.getElementById('btnTempLinkSubmit');
let linksBookmarkTabContainerElem = document.getElementById('linksBookmarkTabContainer');

let col0TempLinks;
let col1TempLinks;
let col2TempLinks;

loadTempLinkElems();

btnTempLinkSubmitElem.addEventListener("click", () => {
    addTempLinkElem();
})

function generateTempLinkElem(label, href) {
    let elem = document.createElement("div");
    elem.className = "btn-group w-100 pb-2";
    elem.innerHTML = "<div class=\"btn-group w-100 pb-2\"><a href=\"" + href + "\" class=\"btn btn-danger w-75\">" + label + "</a><button type=\"button\" class=\"btn btn-danger dropdown-toggle dropdown-toggle-split\" data-bs-toggle=\"dropdown\" aria-expanded=\"false\"><span class=\"visually-hidden\">Toggle Dropdown</span></button><ul class=\"dropdown-menu\"><li><a onclick=\"moveLink(this, \'up\');\" class=\"dropdown-item\" href=\"#\">Move link up</a></li><li><a onclick=\"moveLink(this, \'down\');\" class=\"dropdown-item\" href=\"#\">Move link down</a></li><li><hr class=\"dropdown-divider\"></li><li><a onclick=\"removeSelfTempLink(this);\" class=\"dropdown-item text-danger\" href=\"#\">Remove link</a></li></ul></div>";

    return elem.firstChild;
}

function addTempLinkElem() {
    let linkLabel = inputTempLinkValueElem.value;
    let linkHref = inputTempLinkHrefElem.value;
    let linkCol = inputTempLinkColElem.value;
    console.log("adding temp link elem");
    console.log("linkLabel: " + linkLabel);
    console.log("linkHref: " + linkHref);
    console.log("linkCol: " + linkCol);

    let createdElem = generateTempLinkElem(linkLabel, linkHref);
    console.log("created elem: ", createdElem);
    
    switch (linkCol) {
        case "0":
            col0TempLinks.appendChild(createdElem);
            break;
        case "1":
            col1TempLinks.appendChild(createdElem);
            break;
        case "2":
            col2TempLinks.appendChild(createdElem);
            break;
    
        default:
            break;
    }

    saveTempLinkElems();
}

function removeSelfTempLink(e) {
    console.log("Removing...");
    e.parentNode.parentNode.parentNode.remove();

    saveTempLinkElems();
}

function extractTempLinkElems() {
    return linksBookmarkTabContainerElem.innerHTML;
}

function saveTempLinkElems() {
    let strTempLinkElems = extractTempLinkElems();

    localStorage.setItem("temp-link-elems", strTempLinkElems);
}

function loadTempLinkElems() {
    let strTempLinkElems = localStorage.getItem("temp-link-elems");
    linksBookmarkTabContainerElem.innerHTML = strTempLinkElems;

    col0TempLinks = document.getElementById("col0TempLinks");
    col1TempLinks = document.getElementById("col1TempLinks");
    col2TempLinks = document.getElementById("col2TempLinks");
}

function moveLink(elemLink, strDirection) {
    let elemBtn = elemLink.parentElement.parentElement.parentElement;

    let elemPrevSibling = elemBtn.previousElementSibling;
    let elemNextSibling = elemBtn.nextElementSibling;
    let elemParent = elemBtn.parentNode;

    switch (strDirection) {
        case "up":
            if (elemPrevSibling == null) {
                break;
            }
            elemParent.insertBefore(elemBtn, elemPrevSibling);
            break;
        case "down":
            if (elemNextSibling == null) {
                break;
            }
            elemParent.insertBefore(elemNextSibling, elemBtn);
            break;
    
        default:
            break;
    }
}


console.log("bookmarksLinks.js loaded");