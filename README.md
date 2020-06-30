# Multilingual

Steve Martin, Children's Mercy Hospital, Kansas City, MO<br>
Jen Hoitenga, Children's Mercy Hospital, Kansas City, MO

********************************************************************************
## Instructions

###Getting Started
- Add a variable called languages as a multiple choice field listing your languages as the choices. Make sure you add the action tag @HIDDEN. Make sure your choice values for languages are numeric, starting with 1. Example:<br>
1, English<br>
2, Español

- Refresh the page and you're ready to start entering translations. Remember you have to add the field first and save, then go back and edit it to add translations.

###Title and Instructions
- To add translations for the Survey Title and Instructions for an instrument, add a variable called survey_text_[form_name]. Each instrument should have it's own field with a variable name of "survey_text_[form name]" (Replace [form name] with the name of each instrument). Make sure you add the action tag @HIDDEN.

###Completion Text
- To add translations for Survey Completion Text, add a variable called survey`_text`_finish. Make sure you add the action tag @HIDDEN.

- If you have just one instrument, you can just add the survey`_text`_finish variable and add the Title, Instructions and Completion Text to it.

###Survey Settings (v1.11+)
- Version 1.11 of the module introduces the ability to specify Save & Return Later, e-Consent, and general survey text translations at an instrument's Survey Settings page.
- After creating a 'languages' field for the instrument, navigate to REDCap's Online Designer and click 'Survey Settings'.
- Select a translation language from the drop down below the Survey Status row. This will enable you to change the various text trasnlation settings available.
- After saving your changes, the provided translations will be available to survey participants.

###More Documentation
- <a href="https://cmhredcap.cmh.edu/plugins/media/7610-how-to-use-multilingual-external-module.docx">Click Here</a>

********************************************************************************
