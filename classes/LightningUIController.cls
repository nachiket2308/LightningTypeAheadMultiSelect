/*------------------------------------------------------------------------
 * Author:        Ian Huang
 * Company:       Salesforce.com
 * Description:   Apex controller class for Lightning components 
 *
 * Test Class:    LightningUIControllerTest
 * 
 * History
 * 2016-APR-25    Ian Huang     Created
 --------------------------------------------------------------------------*/
public with sharing class LightningUIController {

    //Result class
	public class Result {
        @AuraEnabled public Id     Id    {get; set;}
        @AuraEnabled public String Name  {get; set;}
        @AuraEnabled public String Description {get; set;}
 
        public Result(Id id, String name, String description) {
            this.Id    = id;
            this.Name  = name;
            this.Description = description;
        }
    }


    //Aura enabled method to search a specified SObject for a specific string
    @AuraEnabled
    public static Result[] lookup(String searchString, String sObjectAPIName) {
        // Sanitze the input
        String sanitizedSearchString = String.escapeSingleQuotes(searchString);
        String sanitizedSObjectAPIName = String.escapeSingleQuotes(sObjectAPIName);

		List<Result> results = new List<Result>();

        // Build SOSL query
        String searchQuery = 'FIND \'' + sanitizedSearchString + '*\' IN ALL FIELDS RETURNING ' + sanitizedSObjectAPIName + '(id,name,';
        if (sanitizedSObjectAPIName == 'Account')
            searchQuery +=  'Ticker__c)';
        else if (sanitizedSObjectAPIName == 'Product2')
            searchQuery +=  'Category__c)';
        else
            searchQuery +=  'email)';
        searchQuery +=  ' Limit 50';        
        
        
        // Execute the Query
        List<List<SObject>> searchList = search.query(searchQuery);

        // Create a list of matches to return
		for (SObject so : searchList[0]) {
			if (sanitizedSObjectAPIName == 'Account')
                results.add(new Result(so.Id, (String)so.get('Name'),  (String)so.get('Ticker__c')));
            else if (sanitizedSObjectAPIName == 'Product2')
                results.add(new Result(so.Id, (String)so.get('Name'),  (String)so.get('Category__c')));
            else
                results.add(new Result(so.Id, (String)so.get('Name'),  (String)so.get('Email')));    
		}
		        
        //results.sort();
        return results;
    }
    
    
    //Retrieve current user sharings for a given Private Activity 
    @AuraEnabled
    public static Result[] loadCampaignMembers(Id recordId) {
        List<Result> results = new List<Result>();
        //Create a list of matches to return
		for (CampaignMember cm : [SELECT Id,ContactId,Contact.Name,Contact.Email FROM CampaignMember WHERE CampaignId = :recordId LIMIT 10000])
            results.add(new Result(cm.ContactId, cm.Contact.Name, cm.Contact.Email));
        return results;
    }
    
    @AuraEnabled
    public static String saveCampaignMembers(Id recordId, List<String> itemIds){
        String resultMsg = '';
        List<CampaignMember> insertCampaignMembers = new List<CampaignMember>();
        List<CampaignMember> deleteCampaignMembers = new List<CampaignMember>();
        
        try {
        	
            Set<String> newContactIds = new Set<String>();
            newContactIds.addAll(itemIds);

            Set<Id> existingContactIds = new Set<Id>();
        	for (CampaignMember cm : [SELECT Id,ContactId FROM CampaignMember WHERE CampaignId = : recordId LIMIT 10000]) {
        		existingContactIds.add(cm.ContactId);
        		//add to delete list if the existing contact not in new contact list
        		if (!newContactIds.contains(cm.ContactId))
        		    deleteCampaignMembers.add(cm);
        	}
                  
        	for (String id : itemIds) {
        		if (!existingContactIds.contains(id))
        		    insertCampaignMembers.add(new CampaignMember(CampaignId=recordId,ContactId=id,Status='Invited'));
        	}
        	
        	if (!insertCampaignMembers.isEmpty()) insert insertCampaignMembers;
        	if (!deleteCampaignMembers.isEmpty()) delete deleteCampaignMembers;
        	
        } catch (Exception ex){
            
            System.debug('Error in updating Campaign Members ' + ex.getMessage() + ' at line number: ' + ex.getLineNumber());
            resultMsg = 'Error in updating Campaign Members';
        }
        return resultMsg;
    }
        
}