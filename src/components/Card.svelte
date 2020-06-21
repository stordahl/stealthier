<script>
    let active = false;
</script>

<div class="card">
    <div class="card-title">
        <h2>{ $$props.data().title }</h2>
            <div class="sub-title-cont">
                <strong>{ $$props.data().city }<span>, { $$props.data().state }</span></strong>
                <a href="{ $$props.data().gmaps }" target="_blank"><button>directions</button></a>
            </div>
    </div>     
    <div class="resources-cont">
        {#each $$props.data().resources as resource}
            <div  class="resource { resource.replace(/\s+/g, '') }">
                { resource }
            </div>
        {/each}
    </div>
    <p class="desc" class:active={active}>{ $$props.data().desc }</p>
    <div class="read-more-cont"> 
        <button on:click="{() => active = !active}">more...</button>
        <h5 class="location-type">Location Type: { $$props.data().type }</h5>
    </div>   
</div>

<style>
    .card{
        display:block;
        break-inside: avoid;
        border:2px solid black;
        /* box-shadow: 10px 10px 10px ; */
        /* border-radius:5px; */
        margin:0 1rem 1rem;
        padding:1rem;
        height: min-content;
    }
    .card-title{
        text-align: left;
    }
    .sub-title-cont{
        display:flex;
        justify-content: space-between;
        align-items:center;
    }
    .resources-cont{
        display:flex;
        justify-content: space-evenly;
        align-items: center;
        flex-wrap:wrap;
        margin: .75rem;
    }
    .resource{
        color:white;
        background:#3933aa;
        font-size:.8rem;
        padding:.25rem .5rem;
        /* border-radius:3px; */
        white-space: nowrap;
        margin:.25rem;
    }
    .Wifi{background-color:	#5f5dc9;}
    .OvernightParking{background-color:#689ee0;}
    .DayParking{background-color:#ea6868;}
    .CoffeeSpot{background-color:#9a4141;}
    .Views{background-color:#af78ef;}
    .Park{background-color:#5eb571;}
    .Laundry{background-color:#346b40;}
    .desc{
        text-align:left;
        display:none;
    }
    .active{
        display:block;
    }
    .read-more-cont{
        display:flex;
        justify-content:space-between;
        align-items:flex-end;
        margin-top:.75rem;
    }
    .location-type{
        text-align:right;
        margin:0;
    }
</style>