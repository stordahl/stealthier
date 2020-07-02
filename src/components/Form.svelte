<script>
    import { db } from "../firebase.js";

    let timestamp = new Date();
    let honeyPot = '';
    let values = {
        title: '',
        city: '',
        state: '',
        gmaps:'',
        desc:'',
        type:'Municipality',
        resources: [],
        timestamp: timestamp.getTime()
    };
    let typeOptions = [
        'Municipality',
        'State Park',
        'National Park / Forest'
    ];
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
        'Coffee Spot',
        'Other'
    ];

    const newListing = () => {
        if (honeyPot === '' && Object.values(values).every(x => (x !== null || x !== ''))){
            db.collection('listings').add(values);
        } else{
            alert('please fill out all of the form fields!');
        }
    };

</script>


<div id="form-wrap">
    <input id="collapsible" class="toggle" type="checkbox">
    <label for="collapsible" class="toggle-label">add new</label>

   <div class="collapsible-content">
    <form class="content-inner" on:submit|preventDefault={newListing}>
      <input type="text" name="title"placeholder="Name" bind:value={values.title} required>
      <input type="text" name="city"placeholder="City" bind:value={values.city} required>
      <input type="text" name="state"placeholder="State" bind:value={values.state} required>
      <input type="text" name="gmaps"placeholder="Google Maps Link" bind:value={values.gmaps} required>
      <select name="type" id="type-select" bind:value={values.type} required>
        {#each typeOptions as type}
            <option value={type}>
                {type}
            </option>
	    {/each}
      </select>
      <div class="resources-container">
      <div class="resources-header">
        <h3>resources</h3>
        <div class="tooltip"> i <span class="tooltiptext">command click for multiple</span> </div>
      </div>
      
      <select name="resources" id="resources-select"  multiple data-placeholder="add resources" bind:value={values.resources} required>
        {#each resourceOptions as resource}
            <option value={resource}>
                {resource}
            </option>
	    {/each}
      </select>
      
      </div>
      <textarea name="desc" id="desc-input" cols="30" rows="5" placeholder="location description..." bind:value={values.desc}></textarea>
        <!-- honey pot -->
        <input class="hp" autocomplete="off" type="text" id="name" name="name" placeholder="Your name here" bind:value={honeyPot}>
      
      <button type="submit">submit</button>
    </form>
   </div>
</div>

<style>
.resources-header{
    display:flex;
    justify-content: space-between;
    margin: .5rem 0;
}
    /* Tooltip container */
.tooltip {
  position: relative;
  display: inline-block;
  border-bottom: 1px dotted black; /* If you want dots under the hoverable text */
}

/* Tooltip text */
.tooltip .tooltiptext {
  visibility: hidden;
  width: 120px;
  background-color: black;
  color: #fff;
  text-align: center;
  padding: 5px 0;
  border-radius: 6px;
  /* Position the tooltip text - see examples below! */
  position: absolute;
  z-index: 10;
}

/* Show the tooltip text when you mouse over the tooltip container */
.tooltip:hover .tooltiptext {
  visibility: visible;
}
    
    .content-inner{
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        align-items: center;
    }
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