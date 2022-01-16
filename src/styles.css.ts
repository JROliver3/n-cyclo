import { css } from 'lit';

export const ncycloStyles = css`
.nav{
  position: absolute;
  display:flex;
  padding:20px;
  width: 100%;
  background-color: #f5f5f5;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}
@media(min-width: 768px){
  .nav{
    align-content: space-between;
    justify-content: center;
  }
}
.nav-body{
display: flex;
flex-wrap: wrap;
width:100%;
padding:15px;
justify-content: space-between;
}
@media(min-width: 768px){
.nav-body{
  width:58%;
}
}
.nav-sec{
display:flex;
opacity: 60%;
}
.nav-left{
justify-content: start;
align-items: center;
}
.nav-right{
justify-content: end;
align-items: center;
}
.logo{
font-size: x-large;
font-weight: bolder;
margin-right: 10px;
}
.nav-button{
font-weight: 500;
padding:10px;
padding-top:13px;
}
.main{
display:flex;
align-items: center;
height: 93vh;
background: #f5f5f5;
margin-top: -10px;
justify-content: center;
}
.selection-main{
display: flex;
padding: 10px 20px;
border-radius: 10px;
box-shadow: 0 0 4px #eeeeee;
max-width: 60%;
margin: auto;
align-items: center;
flex-wrap: wrap;
background-color: white;
justify-content: space-between;
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}
.selection-items{
display: flex;
align-items: flex-end;
flex-wrap: wrap;
width: 100%;
}
.selection-item{
width: 250px;
height: 350px;
box-shadow: 0 0 4px #999;
background-color: rgb(247 244 244);
border-radius: 10px;
margin: 20px;
font-weight: 100;
padding: 1px;
}
.main__title{
padding:12px;
}
button{
background-color:#007dd1;
width: 80px;
height:30px;
border-radius: 3px;
border: 0;
color: white;
}
.new-item-button{
width: auto;
height: auto;
padding: 10px;
}
a, a:hover, a:focus, a:visited{
 text-decoration: none; 
}
a{
color:#000000;
opacity: 80%;
}
a:hover{
color: #000000;
opacity: 100%;
text-decoration: none;
}
a:focus{
text-decoration: none;
opacity: 100%;
color:#000000
}
.section-item-image{
width: 100%;
height: 70%;
background-image: url("../assets/18269307_303.jpg");
border-radius: 10px 10px 0 0;
}
.section-item-description{
display:flex;
justify-content: start;
margin: auto;
padding: 5px;
flex-wrap: wrap;
font-size: 14px;
}
`;