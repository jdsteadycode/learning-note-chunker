// check log.
// console.log("script loaded");

/*
 central place to hold or store data
*/
const dataStore = {
  "chunkedData": [],
};

// grab the html element(s).
const textAreaEl = document.querySelector(".note-textarea");
const splitBtnEl = document.querySelector(".split-btn");

// check log..
// console.log(textAreaEl, splitBtnEl);

// () -> get html template for chunk.
function getChunkHTML(chunkObj, chunkNo) {
  // when chunk string is above 500 characters?
  if (chunkObj["chunkText"].length > 500) {

    // get the sliced chunk.
    let slicedChunk = chunkObj["chunkText"].slice(0, 500);

    // return the final HTML
    return `
    <article class="chunk-card" data-chunk-id="${chunkObj['chunkId']}">
        <div class="chunk-header">
          <span class="chunk-label">Chunk ${chunkNo}</span>
          <button class="copy-btn" type="button">
            <span aria-hidden="true">📋</span> Copy
          </button>
        </div>
        <div class="chunk-text">${slicedChunk}</div>
        <span class="chunk-more">Show more...</span>
      </article>
    `;
  }

  // otherwise, get the normal chunk html.
  return `
    <article class="chunk-card" data-chunk-id="${chunkObj['chunkId']}">
      <div class="chunk-header">
        <span class="chunk-label">Chunk ${chunkNo}</span>
        <button class="copy-btn" type="button">
          <span aria-hidden="true">📋</span> Copy
        </button>
      </div>
      <div class="chunk-text">${chunkObj["chunkText"]}</div>
    </article>
  `;
};

// () -> generate the HTML for chunks of text.
function generateHTML(dataArray, callback) {

  // if array is empty!
  if (dataArray.length == 0) return "<h2>Whoosh, Did you directly clicked on <b>Split notes</b> button 🫣</h2>";

  // initial html (template)
  let html = "";

  // iterate over the data array containing array of chunk objs.
  for(let i = 0; i < dataArray.length; i ++) {

    // pass the chunkObj to callback and accumulate incoming each chunked html template.
    html = html + callback(dataArray[i], i + 1);
  }

  // return the final generate html.
  return html;
};

// () -> render the data (i.e., plug the html into element)
function renderData(generatedHTML, htmlEl) {
  // inside html element's inner HTML plug the generated HTML.
  htmlEl.innerHTML = generatedHTML;
};

// () -> attach button click event (A generic function)
function attachBtnEvent(btn, callback) {
  // attach the handler on `click`!
  btn.onclick = callback;
};


// () -> handle copy button click.
function handleCopy(event) {
  // check log.
  // target where currently event occured!
  // console.log("Event Target ", event.target);

  // target where handler was attached?
  // console.log("Event current target ", event.currentTarget);

  // get the chunk-text element's inner html which contains exact content to copy!
  // i.e., copy-btn's parent is chunk-header and chunk-header element's sibling next is `chunk-text` element which is what is needed!
  const chunkElement = event.currentTarget.parentElement.nextElementSibling;
  // check log.
  // console.log(chunkText);

  // copy the text to clipboard!
  window.navigator.clipboard.writeText(chunkElement.textContent);

  // check log..
  console.log("Copied text!");
};

// () -> fill the chunked data obj
function getChunkObj(string, index) {
  // get structured obj for chunked data array!
  // i.e., {"chunkId": "c-no", "chunkText": "..."};
  return { "chunkId": `c-${index + 1}`, "chunkText": string ?? "n/a"};
};

// () -> handle splitting of data
function handleDataSplit() {
  // check log.
  // console.log(event.target);

  // get the trimmed textAreaEl's data value.
  const rawText = textAreaEl.value.trim();
  // check log..
  // console.log(rawText, typeof rawText);

  // initial chunk string.
  let chunkedString = "";

  // initial chunked - Array
  let chunkedArr = [];

  // initial ith value
  let i = 0;

  // iterate over the string.
  while (i < rawText.length) {
    // accumulate the current ith character
    chunkedString += rawText[i];

    // check if current chunked string contains atleast 3000 characters!
    if (chunkedString.length === 3000) {
      // push the chunkedString into chunked Array.
      chunkedArr.push(chunkedString);

      // then, reset chunked string.
      chunkedString = "";
    }

    // update i.
    i++;
  }

  // check if there is any pending character or characters left?
  if (chunkedString.length != 0) {
    // add to chunked array.
    chunkedArr.push(chunkedString);
  }

  // generate new array with proper structure for chunks! & save it in dataStore's chunkedData
  // i.e., using higher order function `map` of array - this ensures new array is created with intended transformation as by `getChunkObj` helper function.
  dataStore.chunkedData = chunkedArr.map(getChunkObj);

  // generate the html from chunked Array.
  let html = generateHTML(dataStore.chunkedData, getChunkHTML);

  // render the final html.
  renderData(html, document.querySelector(".results"));

  // At the end, iterate over the available copy btns.
  document.querySelectorAll(".copy-btn").forEach(function (copyBtn) {
    // console.log(copyBtn);
    attachBtnEvent(copyBtn, handleCopy);
  });
};

// attach the event on `spit notes btn`!
attachBtnEvent(splitBtnEl, handleDataSplit);

// initially render the data.
if (dataStore.chunkedData.length == 0) renderData("<h2>Write your raw note text, click on split notes button</h2>", document.querySelector(".results"));
