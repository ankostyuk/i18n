local message = 'Message'

local log = require('utils/log')

--------------------------------------------------------------------------------

local message_text = 'Message 1 Message 2 Message Message Message' -- Some comment
message_text = "Message Message Message Message Message" -- Some comment

--------------------------------------------------------------------------------

message_html = [[
  <div class="block">
    Message <div class="row">
              <a class="link"><i class="icon"></i> Message 1</a> Message 2 - Some text
              <input type="text" placeholder="Message"/>
            </div>
    <b>Message Message</b>
  </div>addMessage MessageAdd add Message
]] -- Some comment

--------------------------------------------------------------------------------

if data['Message'] == [[Message]] then -- Some comment
  data["Message"] = 'Some text' -- Some comment
end

message = 'Message'
