<script>
    import { db } from "../firebase.js";

    
        let newListingTitle = '';
        let newListingCity = '';
        let newListingState = '';
        let newListingGmaps = '';
        let newListingDesc = '';

        let newListingType = 'Municipality';
        let typeOptions = [
            'Municipality',
            'State Park',
            'National Park / Forest'
        ];

        let newListingResources = [ ];
        let resourceOptions = [
            'Public Wifi',
            'Overnight Parking',
            'Day Parking',
            'Laundromat',
            'Public Shower',
            'Public Restroom',
            'Port-O-John',
            'Views',
            'Park',
            'Coffee Spot'
        ];

        let honeyPot = '';
    

    function newListing(){
        let timestamp = new Date();
        if (honeyPot === ''){
            db.collection('listings').add({
                title: newListingTitle,
                city: newListingCity,
                state: newListingState,
                gmaps: newListingGmaps,
                resources: newListingResources,
                type: newListingType,
                desc: newListingDesc,
                timestamp: timestamp.getTime()
            });

        } else{
            alert('fuck off bots!');
        }
        
    }

</script>


<div id="form-wrap">
    <input id="collapsible" class="toggle" type="checkbox">
    <label for="collapsible" class="toggle-label">add new</label>

   <div class="collapsible-content">
    <div class="content-inner">
      <input type="text" placeholder="Name" bind:value={newListingTitle} required>
      <input type="text" placeholder="City" bind:value={newListingCity} required>
      <input type="text" placeholder="State" bind:value={newListingState} required>
      <input type="text" placeholder="Google Maps Link" bind:value={newListingGmaps} required>
      <select name="type" id="type-select" bind:value={newListingType} required>
        {#each typeOptions as type}
            <option value={type}>
                {type}
            </option>
	    {/each}
      </select>
      <select name="resources" id="resources-select" multiple bind:value={newListingResources} required>
        {#each resourceOptions as resource}
            <option value={resource}>
                {resource}
            </option>
	    {/each}
      </select>
      <textarea name="desc" id="desc-input" cols="30" rows="5" placeholder="location description..." bind:value={newListingDesc}></textarea>
        <!-- honey pot -->
        <input class="hp" autocomplete="off" type="text" id="name" name="name" placeholder="Your name here" bind:value={honeyPot}>
      
      <input type="submit" on:click={newListing}>
    </div>
   </div>
</div>

<style>
    .hp{
        opacity: 0;
        position: absolute;
        top: 0;
        left: 0;
        height: 0;
        width: 0;
        z-index: -1;
    }
    #form-wrap{
        display: flex;
        justify-content: flex-end;
        flex-direction: column;
        align-items: flex-end;
        margin: 2rem;
    }
    input[type='checkbox'] {
        display: none;
    }
    .toggle-label {
        /* display: block; */
        text-align: center;

        padding: 1rem;

        color: black;
        background: white;

        cursor: pointer;

        border-radius: 7px;
        transition: all 0.25s ease-out;
    }

    .toggle-label:hover {
        color: #689ee0;
    }
    .toggle-label::before {
        content: ' ';
        display: inline-block;

        border-top: 5px solid transparent;
        border-bottom: 5px solid transparent;
        border-left: 5px solid currentColor;

        vertical-align: middle;
        margin-right: .7rem;
        transform: translateY(-2px);

        transition: transform .2s ease-out;
    }
    .collapsible-content {
        max-height: 0px;
        overflow: hidden;
        transition: max-height .25s ease-in-out;
    }
    .toggle:checked + .toggle-label + .collapsible-content {
        max-height: 100vh;
    }   
    .toggle:checked + .toggle-label::before {
        transform: rotate(90deg) translateX(-3px);
    }

    .toggle:checked + .toggle-label {
        border-bottom-right-radius: 0;
        border-bottom-left-radius: 0;
    }
</style>