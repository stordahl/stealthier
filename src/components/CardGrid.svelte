<script>
    import { db } from "../firebase.js";
    import Card from './Card.svelte';

	let arr = [];

	db.collection("listings").orderBy("city", "asc").onSnapshot(snapData => {
		arr = snapData.docs
    });

    
</script>

<div id="card-grid">
	{#each arr as listing}
        <Card  {...listing}/>
	{/each}
</div>	

<style>
    #card-grid{
        display:grid;
        grid-template-columns: 1fr;
        grid-template-rows:auto;
        margin:1rem;
    }
    @media screen and (min-width:768px){
        #card-grid{
            grid-template-columns: 1fr 1fr;
        }
    }
    @media screen and (min-width:1024px){
        #card-grid{
            grid-template-columns: 1fr 1fr 1fr;
        }
    }
</style>