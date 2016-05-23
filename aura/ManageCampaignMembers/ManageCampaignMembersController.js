({
	doInit : function(cmp, event, helper) {
        var recordId = cmp.get("v.recordId");
        if (recordId == null || recordId == '') return;
        
        // Get the search string, input element and the selection container
        var existingItems = cmp.find('existingitems');

        // Show the lookuplist
        $A.util.removeClass(existingItems, 'slds-hide');

        // Create an Apex action
        var action = cmp.get('c.' + cmp.get('v.loadMethod'));

        // Set the parameters
        action.setParams({"recordId" : recordId});
        
        // Define the callback
        action.setCallback(this, function(response) {
            var state = response.getState();
            
            // Callback succeeded
            if (cmp.isValid() && state === "SUCCESS") {
                // Get the search matches
                var existings = response.getReturnValue();
                
                // If we have no matches, return nothing
                if (existings.length == 0) {
                    cmp.set('v.existingItems', null);
                    return;
                }
                // Store the results
                cmp.set('v.existingItems', existings);
            } else if (state === "ERROR") { // Handle any error by reporting it
                var errors = response.getError();
                
                if (errors) {
                    if (errors[0] && errors[0].message) {
                        //this.displayToast('Error', errors[0].message);
                    }
                }
                else {
                    //this.displayToast('Error', 'Unknown error.');
                }
            }
        });
        
        //set init flag to true
        cmp.set('v.isInitialized', true);
        
        // Enqueue the action                  
        $A.enqueueAction(action);
	},
    
    doAddItem : function(cmp, event, helper) {
		var item = event.getParam("Item");
        
        var existings = cmp.get('v.existingItems');
        if (!existings) existings = []; 
        
        existings.push(item);
	    existings = _.uniqBy(existings, 'Id');
        cmp.set("v.existingItems", existings);
        
        cmp.set('v.isDirty', true);
	},
    
    doRemoveItem : function(cmp, event, helper) {
		//var itemId = event.getParam("ItemId");
        cmp.set('v.isDirty', true);
	},
    
    doSave : function(cmp, event, helper) {
        var isInitialized = cmp.get("v.isInitialized");
        var isDirty = cmp.get("v.isDirty");
        if (!isInitialized || !isDirty) return;
        
        var recordId = cmp.get("v.recordId");
        var existings = cmp.get('v.existingItems');
        if (!existings) return;
        
        var itemIds = existings.map(function(item){
					     return item.Id;
		              })
        
        var action = cmp.get('c.' + cmp.get('v.saveMethod'));
        
        action.setParams({"recordId" : recordId,
                          "itemIds" : itemIds});
        
        action.setCallback(this, function(response) {
            var state = response.getState();
            
            // Callback succeeded
            if (cmp.isValid() && state === "SUCCESS") {
                return '';
            } else if (state === "ERROR") {
                var errors = response.getError();
                console.log('doSave - errors[0] = ' + errors[0].message);
                
                return errors[0].message;
                /*
                if (errors) {
                    if (errors[0] && errors[0].message) {
                        helper.displayToast('Error', errors[0].message);
                    }
                }
                else {
                    helper.displayToast('Error', 'Unknown error.');
                }*/
            }
        });
        
        cmp.set('v.isDirty', false);
        // Enqueue the action                  
        $A.enqueueAction(action);                
	}
})