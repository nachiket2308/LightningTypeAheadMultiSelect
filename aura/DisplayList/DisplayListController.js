({
    doRemove: function(cmp, event, helper) {
    	var id = event.currentTarget.id;
        var items = cmp.get('v.items');
        
        //console.log('id=' + id);
        //console.log('items=' + items);
        
        if (items.length > 0) {
           var removeItem = _.remove(items,function(item){
				return item.Id == id;
		   })
           cmp.set("v.items", items);
        }
        
        var evt = $A.get("e.c:RemoveItem");
        evt.setParams({ "ItemId": id });
        evt.fire();
    }
})