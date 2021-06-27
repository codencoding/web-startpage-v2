// var launchLinksJSON
var launchLinksContainer

function createSectionElem(sectionData) {
    let sectionElem = document.createElement("div")
    sectionElem.classList = "list-group list-group-flush bg-dark p-0 rounded mt-2"

    let header = document.createElement("h3")
    header.className = "p-1 border-bottom border-danger m-0"
    header.innerHTML = sectionData["sectionName"]
    sectionElem.appendChild(header)

    sectionData["sectionData"].forEach(sectionObj => {
        let linkElem = document.createElement("a")

        linkElem.href = sectionObj["href"]
        linkElem.innerHTML = sectionObj["displayName"]
        linkElem.classList = "list-group-item list-group-item-action text-light p-0 ps-2 m-0 border-0"

        sectionElem.appendChild(linkElem)
    });

    return sectionElem
}

function createLaunchLinkCol(colData) {
    let colElem = document.createElement("div")
    colElem.classList = "col-sm ms-2"

    colData.forEach(sectionData => {
        colElem.appendChild(createSectionElem(sectionData))
    });

    return colElem
}

function populateLaunchLinks(launchLinksJSON) {
    if (launchLinksJSON === undefined) {
        throw new Error("Couldn't populate launch links, launch links file not loaded")
    }

    for (const colKey in launchLinksJSON) {
        if (Object.hasOwnProperty.call(launchLinksJSON, colKey)) {
            const colData = launchLinksJSON[colKey];
            
            let colElem = createLaunchLinkCol(colData)
            
            launchLinksContainer.appendChild(colElem)
        }
    }
}