import { css } from 'lit';

export const wordsmithStyles = css`
.wordsmith-main {
    align-items: center;
    width: 80%;
    margin: auto;
    z-index:-1;
}
@media(min-width: 768px){
    .wordsmith-main {
        align-items: center;
        width: 60%;
        margin: auto;
    }
}
.wordsmith-text-area{
    height: fit-content;
    height: -moz-fit-content;
    display: flex;
    flex-wrap: wrap;
    flex-grow: 3;
    width: 100%;
    align-content: flex-start;
    place-content: flex-start;
    user-select: none;
    padding-bottom: 1em;
    padding-top: 1em;
    font-family: monospace;
    font-size: 22pt;
    margin: auto;
    justify-content: center;
    align-items: center;
}
.wordsmith-track{
    margin-top: -50px;
}
.hidden-word, cursor{
    font-family: monospace;
    font-size: 22pt;
}
.hidden-word, .hidden-word-active, .hidden-word-done{
    display:flex;
}
textarea:focus{
    border:none;
}
.user-input, .user-answer{
    display: flex;
    font-size: 22pt;
}
.user-input-correct{
    text-decoration: underline;
    text-decoration-color: #04ab04;
}
.user-input-incorrect{
    text-decoration: underline;
    text-decoration-color: #cf2424;
}
#cursor {
    font-weight: 100;
    font-size: 30px;
    margin: -1px -6px -1px;
    height: 0;
    color: #2E3D48;
    -webkit-animation: 1s blink step-end infinite;
    -moz-animation: 1s blink step-end infinite;
    -ms-animation: 1s blink step-end infinite;
    -o-animation: 1s blink step-end infinite;
    animation: 1s blink step-end infinite;
    }
@keyframes blink {
    from, to {
        color: transparent;
    }
    50% {
        color: black;
    }
}
@-moz-keyframes blink {
    from, to {
        color: transparent;
    }
    50% {
        color: black;
    }
}
@-webkit-keyframes blink {
    from, to {
        color: transparent;
    }
    50% {
        color: black;
    }
}
@-ms-keyframes blink {
    from, to {
        color: transparent;
    }
    50% {
        color: black;
    }
}
@-o-keyframes blink {
    from, to {
        color: transparent;
    }
    50% {
        color: black;
    }
}
.row-option{
    opacity:60%;
    font-size: 14px;
    margin-right: 10px;
}
.row-option:hover, .row-option-selected:hover{
    opacity: 100%;
    cursor:pointer;
}
.row-option-selected{
    opacity: 100%;
    font-size: 14px;
    margin-right: 10px;
}
.row-option-static{
    opacity:60%;
    font-size: 14px;
    margin-right: 10px;
}
.menu-row{
    display: flex;
    justify-content: center;
}
@media(min-width: 768px){
    .menu-row{
        justify-content: end;
    }
}
.wordsmith-menu-options{
        position: absolute;
        bottom: 100px;
        right: 50%;
        left: 50%
    }
@media(min-width: 768px){
    .wordsmith-menu-options{
        position: absolute;
        bottom: 0;
        right: 0;
        margin-bottom: 50px;
        margin-right:21%;
    }
}
.wordsmith-widget{
    height:10px;
    display:flex;
    justify-content: center;
    flex-direction: column;
    align-items: center;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    font-size: 20px;
}
#refresh-button{
    opacity: 60%
}
#refresh-button:hover{
    opacity: 100%;
    cursor: pointer;
}
.stage-status, track-status{
    opacity: 60%;
}
.wordsmith-results-modal{
margin-top: -50;
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}
.result-title{
    font-size: 60px;
    text-align: center;
    opacity: 60%;
}

.options-array{
    text-align: center;
    font-size: 18px;
}
.results{
    display: flex;
    padding:20px;
}
.result-col-1, .result-col-2{
    width:50%;
}
.result-col-1{
    margin-right:-20px;
}
.result-col-2{
        margin-left:60px;
    }
@media(min-width: 780px){
    .result-col-2{
        margin-left:80px;
    }
}
.col-1-row-1, .col-1-row-2, .col-2-row-1, .col-2-row-2{
    display: flex;
    align-items: baseline;
    justify-content: end;
}
.col-1-row-1-col-2{
    font-size: 28px;
    margin-left: 15px;
}
@media(min-width: 780px){
    .col-1-row-1-col-2{
        margin-left: 20px;
    }
}
.col-1-row-2-col-2{
    font-size: 22px;
    opacity: 80%;
    margin-left: 20px;
}
.col-1-row-1-col-1, .col-1-row-2-col-1{
    font-size:22px;
    opacity:80%;
}
.col-1-row-3{
    display: flex;
    justify-content: flex-end;
    margin-left: 85px;
    font-size: 28px;
}
.help{
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    opacity: 50%;
    bottom: 10%;
    position: absolute;
    left: 47%;
    pointer-events: none;
    display:none;
}
@media(min-width: 1000px){
    .help{
        display: block;
    }
}
#wordsInput{
    opacity: 0;
    padding: 0px;
    margin: 0px;
    border: none;
    outline: none;
    display: block;
    resize: none;
    position: fixed;
    cursor: default;
    width: 60%;
    height: 15%;
}
.wordsmith-dashboard{
    display:flex;
    flex-wrap: wrap;
}
@media(max-width:768px){
    .focus-mode-row{
        min-width: 95px;
        margin-left: -45px;
    }
}
.mobile-keyboard{
    margin-top: 30vh;
}
.wordsmith-timer{
    text-align: center;
    font-size:30px;
    opacity: 60%;
}`;