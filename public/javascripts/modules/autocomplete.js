function autocomplete(input, latInput, lngInput){
    if (!input) return; //skip if no input on the page
    const dropdown = new google.maps.places.Autocomplete(input)
    
    dropdown.addListener('place_changed', ()=>{
        const place = dropdown.getPlace();
        latInput.value = place.geometry.location.lat();
        lngInput.value = place.geometry.location.lng();
    });
    //pressing "enter" at hte address inputfield should not submit the form. Below code is to stop that
    input.on('keydown',(e)=>{ 
        // ".on" is from bling.js
        if(e.keyCode === 13) e.preventDefault();
        // 13 is keyCode for "enter"
    });


}

export default autocomplete;