multiselect-native
============
Native drowdown-dialog. It is multi-instance and customizable component.

## Installation

    $ npm install express ejs
    $ node server.js
    
Then you can access your browser with url: http://localhost:8080


## Basic structure
Component consists of preview window for avatars, filter selector and dropdown dialog. There are some options to customize it. When no options added component will be rendered with minimum required functionality.
### data-multiple
Allows to multiselect users
### data-autocomplete
Allows to have 'type and filter' functionality
### data-remote
Includes Ajax request for additional search by user's domain
### data-imgs
Shows people avatars in dialog and preview window

    <div class="multiselect" data-multiple data-autocomplete data-remote data-imgs>
      <div class="imgs"></div>
      <div>
        <span class="title">Please find people from here:</span>
        <div class="selector">
          <input type="text" placeholder="Search" />
        </div>
        <div class="dialog">
          <ul></ul>
        </div>
      </div>
    </div>   
