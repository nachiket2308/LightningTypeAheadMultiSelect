({
	doSearch : function(cmp, event, helper) {
        var searchString = cmp.get('v.searchString');
        var inputElement = cmp.find('lookup');
        var lookupList = cmp.find('lookuplist');

        // Clear any errors and destroy the old lookup items container
        inputElement.set('v.errors', null);
        
        // We need at least 2 characters for an effective search
        if (typeof searchString === 'undefined' || searchString.length < 2)
        {
            // Hide the lookuplist
            $A.util.addClass(lookupList, 'slds-hide');
            return;
        }

        // Show the lookuplist
        $A.util.removeClass(lookupList, 'slds-hide');
        
        // Get the API Name
        var sObjectAPIName = cmp.get('v.sObjectAPIName');

        // Create an Apex action
        var action = cmp.get('c.lookup');

        // Mark the action as abortable, this is to prevent multiple events from the keyup executing
        action.setAbortable();

        // Set the parameters
        action.setParams({ "searchString" : searchString, "sObjectAPIName" : sObjectAPIName});
                          
        // Define the callback
        action.setCallback(this, function(response) {
            var state = response.getState();

            // Callback succeeded
            if (cmp.isValid() && state === "SUCCESS")
            {
                // Get the search matches
                var matches = response.getReturnValue();

                // If we have no matches, return nothing
                if (matches.length == 0)
                {
                    cmp.set('v.matches', null);
                    return;
                }
                
                // Store the results
                cmp.set('v.matches', matches);
            }
            else if (state === "ERROR") // Handle any error by reporting it
            {
                var errors = response.getError();
                
                if (errors) 
                {
                    if (errors[0] && errors[0].message) 
                    {
                        //this.displayToast('Error', errors[0].message);
                    }
                }
                else
                {
                    //this.displayToast('Error', 'Unknown error.');
                }
            }
        });
        
        // Enqueue the action                  
        $A.enqueueAction(action);                  
    },
    
    doBlur : function(cmp, event, helper) {
        var searchString = cmp.get("v.searchString");
        if (searchString == '') {
        	var lookupList = cmp.find("lookuplist");
        	$A.util.addClass(lookupList, 'slds-hide');
    	}
    },
    
    addItem : function(cmp, event, helper) {
        var recordId = event.currentTarget.id;
        console.log('adduser:recordId = ' + recordId);
        var matches = cmp.get('v.matches');
        console.log('addUser:matches = ' + matches);
        
        var selectedItem = _.find(matches, function(item) {
            return item.Id == recordId;
        });
        
        var evt = $A.get("e.c:SelectItem");
        evt.setParams({ "Item": selectedItem });
        evt.fire();
        
        // Hide the Lookup List
        var lookupList = cmp.find("lookuplist");
        $A.util.addClass(lookupList, 'slds-hide');

        // Hide the Input Element
        //var inputElement = cmp.find('lookup');
        //$A.util.addClass(inputElement, 'slds-hide');

        // Show the Lookup pill
        var lookupPill = cmp.find("lookup-pill");
        $A.util.removeClass(lookupPill, 'slds-hide');

        // Clear the Search string
        cmp.set("v.searchString", '');     
        
        // Lookup Div has selection
        //var inputElement = cmp.find('lookup-div');
        //$A.util.addClass(inputElement, 'slds-has-selection');
    },
})