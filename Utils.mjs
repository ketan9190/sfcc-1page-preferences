import fs from 'fs'
import path from 'path';

export const createHTML = function (data) {

    var writeFile = fs.createWriteStream(path.join(process.cwd(), 'SFCC-OnePagePreferences.html'), {
        flags: 'w+'
    })

    writeFile.write(`<!doctype html>
    <html lang="en">
      <head>
        <!-- Required meta tags -->
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    
        <!-- Bootstrap CSS -->
         <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.3.1/dist/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">
         <script src="https://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js"></script>
         <script>
                $(document).on('keyup', 'input.search', function () {
                    var value = $(this).val().toLowerCase();
                    // eslint-disable-next-line array-callback-return
                    $('.search-row:not(.d-none)').filter(function () {
                        $(this).toggle($(this).children('.search-field').text().toLowerCase()
                            .indexOf(value) > -1);
                        
                    });
                });

                $( document ).tooltip();

         </script>
         <style>
            table {
            
                table-layout: fixed;
                    overflow-wrap: break-word;
                    width : 100vw
                
            }
            thead {
                position : sticky;
                top:0;
            }
    </style>
        <title>SFCC-One Page Preferences</title>
      </head>
      <body>
    <div>
    <h2 class="text-center mt-4 mb-4">SFCC-One Page Preferences</h2>
    
    <div class="button-wrapper">
       <input type="text" class="form-control m-2 mx-auto search" placeholder="Search Site Preference" style="
    width: 51vw;
">
    </div>


    <table class="table table-sm table-striped table-bordered table-hover">
    <thead>
        <tr class="table-primary">
          <th scope="col">#</th>
    `)

    for (let group in data) {
        if (data[group].hits && data[group].hits.length) {
            for (let siteValue in data[group].hits[0]['site_values']) {
                writeFile.write(`<th scope="col">${siteValue}</th>`)
            }
            break;
        }

    }

    writeFile.write(`</tr>
    </thead>`)
    for (let group in data) {


        writeFile.write(`<tr class="search-row">
        <th scope="row"  class="table-primary">${group}</th>
        </tr>`)

        if (data[group].hits) {
            for (let hit of data[group].hits) {
                let attributeName = hit.display_name && hit.display_name.default ? hit.display_name.default : '';

                writeFile.write(`<tr class="search-row">
            <th scope="row" class="search-field" title="Group - ${group}">${attributeName}<span class="font-weight-light">
             (${hit.id})</span></th>
            `)
                if (hit.site_values) {
                    let defaultValue = hit.attribute_definition && hit.attribute_definition.default_value ? hit.attribute_definition.default_value.value : '';
                    for (let siteValue in hit.site_values) {
                        let value = hit.site_values[siteValue] && hit.site_values[siteValue].markup ? hit.site_values[siteValue].markup : hit.site_values[siteValue];
                        if (value === null) {
                            value = defaultValue;
                        }
                        if (value && typeof value === 'string' && value.indexOf('<') >= 0 && value.indexOf('>') >= 0) {
                            value = value.replace(/</g, '&lt;').replace(/>/g, '&gt;');
                        }
                        writeFile.write(`<td class="col-2 search-field">${value}</td>`)
                    }
                }
                writeFile.write(`</tr>`);

            }
        }

    }

    writeFile.write(`</table></div>
    </body>
    </html>`);

    return writeFile.path;

}