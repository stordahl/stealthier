
<footer>
    <span>Copyright 2020 <a href="http://jacobstordahl.com/">Jacob Stordahl</a></span> 
    <span class="pipe"> | </span>
        <hr>
    <span id="kofi"> <a href='https://ko-fi.com/W7W81PO93' target='_blank'><img height='36' style='border:0px;height:36px;' src='https://cdn.ko-fi.com/cdn/kofi5.png?v=2' border='0' alt='Buy Me a Coffee at ko-fi.com' /></a> </span> 
    <span class="pipe"> | </span> 
    <span>Contribute on <a href="https://github.com/stordahl/stealthier">Github</a></span>
</footer>

<style>
    footer{
        width:max-content;
        display:flex;
        flex-direction: column;
        justify-content: space-around;
        align-items:center;
        margin:4rem auto 0;
    }
    hr{
        width:100%;
        margin:1rem 0;
    }
    #kofi, .pipe{
        display: none;
    }
    a{
        text-decoration: none;
    }
    a:visited{
        color:gray;
    }
    a:hover{
        text-decoration:underline;
        background-color:#fff;
    }
    @media screen and (min-width:900px){
        footer{
            width:90vw;
            flex-direction:row;
        }
        hr{
            display:none;
        }
        #kofi, .pipe{
            display: inline-block;
        }
    }
</style>