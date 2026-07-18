

// ==========================================================
// DOM ELEMENTS
// ==========================================================

const queryInput = document.getElementById("query");
const modeSelect = document.getElementById("mode");

const researchBtn = document.getElementById("researchBtn");

const loading = document.getElementById("loading");
const loadingText = document.getElementById("loadingText");

const reportContainer = document.getElementById("reportContainer");
const report = document.getElementById("report");

const stats = document.getElementById("stats");

const timeElement = document.getElementById("time");
const wordsElement = document.getElementById("words");
const readingElement = document.getElementById("reading");
const sourcesCount = document.getElementById("sourcesCount");

const sourcesContainer = document.getElementById("sources");
const sourcesSection = document.getElementById("sourcesSection");

const historyContainer = document.getElementById("history");

const copyBtn = document.getElementById("copyBtn");
const downloadPDF = document.getElementById("downloadPDF");
const downloadTXT = document.getElementById("downloadTXT");
const clearBtn = document.getElementById("clearBtn");



// ==========================================================
// LOADING TEXTS
// ==========================================================

const loadingMessages = [

    "🔍 Searching trusted sources...",

    "📚 Reading web pages...",

    "🧠 Analyzing information...",

    "✍️ Writing professional report...",

    "✅ Finalizing..."

];

let loadingInterval = null;



// ==========================================================
// LOADING ANIMATION
// ==========================================================

function startLoading(){

    loading.classList.remove("hidden");

    reportContainer.classList.add("hidden");

    stats.classList.add("hidden");

    sourcesSection.classList.add("hidden");

    researchBtn.disabled = true;

    let index = 0;

    loadingText.textContent = loadingMessages[index];

    loadingInterval = setInterval(() => {

        index++;

        if(index >= loadingMessages.length){

            index = 0;

        }

        loadingText.textContent = loadingMessages[index];

    },1800);

}



function stopLoading(){

    clearInterval(loadingInterval);

    loading.classList.add("hidden");

    researchBtn.disabled = false;

}



// ==========================================================
// RESEARCH BUTTON
// ==========================================================

researchBtn.addEventListener("click", performResearch);

queryInput.addEventListener("keydown",(event)=>{

    if(event.key==="Enter" && !event.shiftKey){

        event.preventDefault();

        performResearch();

    }

});



// ==========================================================
// MAIN FUNCTION
// ==========================================================

async function performResearch(){

    const query = queryInput.value.trim();

    if(query===""){

        alert("Please enter a research topic.");

        return;

    }

    startLoading();

    try{

        const response = await fetch("/research",{

            method:"POST",

            headers:{

                "Content-Type":"application/json"

            },

            body:JSON.stringify({

                query:query,

                mode:modeSelect.value

            })

        });

        const data = await response.json();

        if(!response.ok){

            throw new Error(data.error || "Something went wrong.");

        }

        showReport(data);

    }

    catch(error){

        stopLoading();

        alert(error.message);

        console.error(error);

    }

}



// ==========================================================
// SHOW REPORT
// ==========================================================

function showReport(data){

    stopLoading();

    reportContainer.classList.remove("hidden");

    stats.classList.remove("hidden");

    sourcesSection.classList.remove("hidden");

    reportContainer.classList.add("fade-in");

    stats.classList.add("fade-in");

    sourcesSection.classList.add("fade-in");

    report.innerHTML = marked.parse(data.report);

    updateStatistics(data);

    renderSources(data.sources);

    saveHistory(data.query);

    reportContainer.scrollIntoView({

        behavior:"smooth"

    });

}

const clearHistoryBtn = document.getElementById("clearHistoryBtn");

if(clearHistoryBtn){

    clearHistoryBtn.addEventListener("click",()=>{

        if(confirm("Clear all search history?")){

            clearHistory();

        }

    });

}


// ==========================================================
// UPDATE STATISTICS
// ==========================================================

function updateStatistics(data){

    // Research Time

    timeElement.textContent = `${data.time} sec`;


    // Word Count

    const words = countWords(data.report);

    wordsElement.textContent = words;


    // Reading Time

    const minutes = Math.max(1, Math.ceil(words / 200));

    readingElement.textContent = `${minutes} min`;


    // Sources

    sourcesCount.textContent = data.sources.length;

}



// ==========================================================
// WORD COUNTER
// ==========================================================

function countWords(text){

    if(!text){

        return 0;

    }

    return text
        .trim()
        .split(/\s+/)
        .length;

}



// ==========================================================
// CHARACTER COUNTER
// (Useful for future features)
// ==========================================================

function countCharacters(text){

    if(!text){

        return 0;

    }

    return text.length;

}



// ==========================================================
// ESTIMATED READING TIME
// (Reusable Helper)
// ==========================================================

function estimateReadingTime(text){

    const words = countWords(text);

    return Math.max(1, Math.ceil(words / 200));

}



// ==========================================================
// REPORT INFORMATION
// ==========================================================

function getReportInfo(reportText){

    return{

        words:countWords(reportText),

        characters:countCharacters(reportText),

        reading:estimateReadingTime(reportText)

    };

}



// ==========================================================
// OPTIONAL CONSOLE INFO
// ==========================================================

function logResearchInfo(data){

    const info = getReportInfo(data.report);

    console.log("Research Completed");

    console.table({

        Query:data.query,

        Time:data.time,

        Words:info.words,

        Characters:info.characters,

        Reading:`${info.reading} min`,

        Sources:data.sources.length

    });

}







// ==========================================================
// RENDER SOURCES
// ==========================================================

function renderSources(sources){

    sourcesContainer.innerHTML = "";

    if(!sources || sources.length === 0){

        sourcesContainer.innerHTML = `
            <div class="empty-state">
                <h3>No Sources Found</h3>
                <p>The search didn't return any sources.</p>
            </div>
        `;

        return;

    }

    sources.forEach(source => {

        const card = createSourceCard(source);

        sourcesContainer.appendChild(card);

    });

}



// ==========================================================
// CREATE SOURCE CARD
// ==========================================================

function createSourceCard(source){

    const card = document.createElement("div");

    card.className = "source-card fade-in";

    const domain = getDomain(source.url);

    const favicon = getFavicon(source.url);

    card.innerHTML = `

        <div class="source-header">

            <img
                src="${favicon}"
                class="source-icon"
                alt="favicon"
            >

            <div>

                <h3>${escapeHTML(source.title)}</h3>

                <span class="source-domain">

                    ${domain}

                </span>

            </div>

        </div>

        <a
            href="${source.url}"
            target="_blank"
            rel="noopener noreferrer"
        >

            Visit Source →

        </a>

    `;

    return card;

}



// ==========================================================
// EXTRACT DOMAIN
// ==========================================================

function getDomain(url){

    try{

        return new URL(url).hostname.replace("www.","");

    }

    catch{

        return url;

    }

}



// ==========================================================
// GOOGLE FAVICON
// ==========================================================

function getFavicon(url){

    try{

        const hostname = new URL(url).hostname;

        return `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`;

    }

    catch{

        return "";

    }

}



// ==========================================================
// ESCAPE HTML
// ==========================================================

function escapeHTML(text){

    const div = document.createElement("div");

    div.textContent = text;

    return div.innerHTML;

}



// ==========================================================
// HISTORY STORAGE KEY
// ==========================================================

const HISTORY_KEY = "ai_research_history";



// ==========================================================
// SAVE SEARCH
// ==========================================================

function saveHistory(query){

    if(!query || query.trim()===""){

        return;

    }

    let history = getHistory();

    // Remove duplicate

    history = history.filter(item => item !== query);

    // Add newest at top

    history.unshift(query);

    // Keep only last 10

    history = history.slice(0,10);

    localStorage.setItem(

        HISTORY_KEY,

        JSON.stringify(history)

    );

    renderHistory();

}



// ==========================================================
// GET HISTORY
// ==========================================================

function getHistory(){

    const stored = localStorage.getItem(HISTORY_KEY);

    if(!stored){

        return [];

    }

    try{

        return JSON.parse(stored);

    }

    catch{

        return [];

    }

}



// ==========================================================
// RENDER HISTORY
// ==========================================================

function renderHistory(){

    const history = getHistory();

    historyContainer.innerHTML = "";

    if(history.length===0){

        historyContainer.innerHTML=`

            <div class="empty-state">

                <h3>No Recent Searches</h3>

                <p>Your previous research topics will appear here.</p>

            </div>

        `;

        return;

    }

    history.forEach(query=>{

        const card = document.createElement("div");

        card.className="history-item fade-in";

        card.innerHTML=`

            <p>${escapeHTML(query)}</p>

        `;

        card.addEventListener("click",()=>{

            queryInput.value=query;

            performResearch();

        });

        historyContainer.appendChild(card);

    });

}



// ==========================================================
// CLEAR HISTORY
// ==========================================================

function clearHistory(){

    localStorage.removeItem(HISTORY_KEY);

    renderHistory();

}



// ==========================================================
// EXPORT HISTORY
// ==========================================================

function exportHistory(){

    const history=getHistory();

    return JSON.stringify(history,null,2);

}



// ==========================================================
// IMPORT HISTORY
// ==========================================================

function importHistory(historyArray){

    if(!Array.isArray(historyArray)){

        return;

    }

    localStorage.setItem(

        HISTORY_KEY,

        JSON.stringify(historyArray)

    );

    renderHistory();

}



// ==========================================================
// PAGE LOAD
// ==========================================================

document.addEventListener("DOMContentLoaded",()=>{

    renderHistory();

});



// ==========================================================
// TOAST NOTIFICATION
// ==========================================================

function showToast(message, type = "success") {

    const existing = document.querySelector(".toast");

    if (existing) {
        existing.remove();
    }

    const toast = document.createElement("div");

    toast.className = `toast toast-${type}`;

    toast.innerHTML = `
        <span>${message}</span>
    `;

    document.body.appendChild(toast);

    setTimeout(() => {

        toast.classList.add("show");

    }, 50);

    setTimeout(() => {

        toast.classList.remove("show");

        setTimeout(() => {

            toast.remove();

        }, 300);

    }, 3000);

}



// ==========================================================
// COPY REPORT
// ==========================================================

copyBtn.addEventListener("click", async () => {

    if (report.innerText.trim() === "") {

        showToast("No report to copy!", "error");

        return;

    }

    try {

        await navigator.clipboard.writeText(report.innerText);

        showToast("Report copied successfully!");

    }

    catch (err) {

        console.error(err);

        showToast("Failed to copy report.", "error");

    }

});



// ==========================================================
// THEME TOGGLE
// ==========================================================

const themeToggle = document.getElementById("themeToggle");

const THEME_KEY = "theme";



function applyTheme(theme) {

    document.body.setAttribute("data-theme", theme);

    if (theme === "dark") {

        themeToggle.textContent = "☀️";

    }

    else {

        themeToggle.textContent = "🌙";

    }

}



function loadTheme() {

    const saved = localStorage.getItem(THEME_KEY);

    if (saved) {

        applyTheme(saved);

    }

    else {

        applyTheme("light");

    }

}



themeToggle.addEventListener("click", () => {

    const current = document.body.getAttribute("data-theme");

    const next = current === "dark"

        ? "light"

        : "dark";

    localStorage.setItem(

        THEME_KEY,

        next

    );

    applyTheme(next);

});



// ==========================================================
// IMPROVED SHOW REPORT
// ==========================================================

const originalShowReport = showReport;

showReport = function(data){

    originalShowReport(data);

    logResearchInfo(data);

    showToast("Research completed successfully!");

};


// ==========================================================
// CURRENT RESEARCH DATA
// ==========================================================

let currentResearch = null;



// ==========================================================
// STORE LATEST RESEARCH
// ==========================================================



showReport = function(data){

    currentResearch = data;

    originalShowReport(data);

    logResearchInfo(data);

    showToast("Research completed successfully!");

};



// ==========================================================
// DOWNLOAD HELPER
// ==========================================================

async function downloadFile(url, filename){

    if(!currentResearch){

        showToast("Generate a report first.","error");

        return;

    }

    try{

        const response = await fetch(url,{

            method:"POST",

            headers:{

                "Content-Type":"application/json"

            },

            body:JSON.stringify({

                query:currentResearch.query,

                mode:currentResearch.mode,

                report:currentResearch.report,

                sources:currentResearch.sources

            })

        });

        if(!response.ok){

            throw new Error("Download failed.");

        }

        const blob = await response.blob();

        const objectURL = window.URL.createObjectURL(blob);

        const a = document.createElement("a");

        a.href = objectURL;

        a.download = filename;

        document.body.appendChild(a);

        a.click();

        a.remove();

        window.URL.revokeObjectURL(objectURL);

    }

    catch(error){

        console.error(error);

        showToast(error.message,"error");

    }

}



// ==========================================================
// PDF DOWNLOAD
// ==========================================================

downloadPDF.addEventListener("click",()=>{

    downloadFile(

        "/download/pdf",

        "research_report.pdf"

    );

});



// ==========================================================
// TXT DOWNLOAD
// ==========================================================

downloadTXT.addEventListener("click",()=>{

    downloadFile(

        "/download/txt",

        "research_report.txt"

    );

});



// ==========================================================
// KEYBOARD SHORTCUTS
// ==========================================================

document.addEventListener("keydown",(event)=>{

    // Ctrl + Enter → Research

    if(event.ctrlKey && event.key==="Enter"){

        performResearch();

    }

    // Ctrl + C (only when report is focused isn't overridden;
    // we use Ctrl+Shift+C for copy button)

    if(event.ctrlKey && event.shiftKey && event.key.toLowerCase()==="c"){

        event.preventDefault();

        copyBtn.click();

    }

});



// ==========================================================
// AUTO RESIZE TEXTAREA
// ==========================================================

queryInput.addEventListener("input",()=>{

    queryInput.style.height="auto";

    queryInput.style.height=queryInput.scrollHeight+"px";

});



// ==========================================================
// RESET BUTTON STATE
// ==========================================================

function resetUI(){

    report.innerHTML="";

    sourcesContainer.innerHTML="";

    reportContainer.classList.add("hidden");

    stats.classList.add("hidden");

    sourcesSection.classList.add("hidden");

}

// ==========================================================
// CLEAR CURRENT RESEARCH
// ==========================================================

clearBtn.addEventListener("click", () => {

    queryInput.value = "";

    resetUI();

    queryInput.focus();

    showToast("Ready for a new research session!");

});

// ==========================================================
// MARKDOWN SETTINGS
// ==========================================================

if(typeof marked !== "undefined"){

    marked.setOptions({

        breaks:true,

        gfm:true

    });

}



// ==========================================================
// DISABLE DOWNLOAD BUTTONS INITIALLY
// ==========================================================

downloadPDF.disabled = true;
downloadTXT.disabled = true;
copyBtn.disabled = true;



// ==========================================================
// ENABLE ACTION BUTTONS
// ==========================================================

function enableReportActions(){

    downloadPDF.disabled = false;

    downloadTXT.disabled = false;

    copyBtn.disabled = false;

    clearBtn.disabled = false;

}




// ==========================================================
// DISABLE ACTION BUTTONS
// ==========================================================


function disableReportActions(){

    downloadPDF.disabled = true;

    downloadTXT.disabled = true;

    copyBtn.disabled = true;

    clearBtn.disabled = true;

}



// ==========================================================
// UPDATE SHOW REPORT
// ==========================================================

const previousShowReport = showReport;

showReport = function(data){

    currentResearch = data;

    previousShowReport(data);

    enableReportActions();

};



// ==========================================================
// UPDATE RESET UI
// ==========================================================

const previousResetUI = resetUI;

resetUI = function(){

    previousResetUI();

    disableReportActions();

};



// ==========================================================
// AUTO FOCUS
// ==========================================================

window.addEventListener("load",()=>{

    queryInput.focus();

});



// ==========================================================
// PLACEHOLDER EXAMPLES
// ==========================================================

const examples=[

    "Impact of Artificial Intelligence on Healthcare",

    "Latest advancements in Quantum Computing",

    "Future of Renewable Energy",

    "Cybersecurity threats in 2026",

    "Large Language Models vs Traditional Search",

    "How AGI may change software engineering"

];



queryInput.addEventListener("focus",()=>{

    if(queryInput.value===""){

        const random=

            examples[Math.floor(Math.random()*examples.length)];

        queryInput.placeholder=random;

    }

});



// ==========================================================
// RESEARCH BUTTON LOADING STATE
// ==========================================================

const originalStartLoading=startLoading;

startLoading=function(){

    originalStartLoading();

    researchBtn.innerHTML="⏳ Researching...";

};



const originalStopLoading=stopLoading;

stopLoading=function(){

    originalStopLoading();

    researchBtn.innerHTML="🔍 Start Research";

};



// ==========================================================
// WINDOW ERROR LOGGER
// ==========================================================

window.addEventListener("error",(event)=>{

    console.error(

        "JavaScript Error:",

        event.error

    );

});



// ==========================================================
// INITIALIZE APPLICATION
// ==========================================================

document.addEventListener("DOMContentLoaded",()=>{

    renderHistory();

    loadTheme();

    disableReportActions();

    console.log(

        "%cAI Research Assistant Ready",

        "color:#4F46E5;font-size:18px;font-weight:bold;"

    );

    console.log(

        "Frontend initialized successfully."

    );

});

