import fs from 'fs'
import path from 'path';

var sigLinks="";
var productionLinks = "";
var stagingLinks = "";
var developmentLinks = "";

var SIG = {
}

var PIG = {
}

if(Object.keys(SIG).length){
    sigLinks+=` <div class="col">
    CICD
    <ul>`
    Object.keys(SIG).forEach(function(key) {
        sigLinks+=`<li><a href='#' host="${key}.dx.commercecloud.salesforce.com">${SIG[key]}</a> -
        <a class="bmlink" href="https://${key}.dx.commercecloud.salesforce.com/on/demandware.store/Sites-Site/default/ViewApplication-DisplayWelcomePage" target="_blank">BM</a>
        </li>`
    })

    sigLinks+=` </ul>
    </div>`
}

if(Object.keys(PIG).length){
    productionLinks+=` <div class="col">
    Production
    <ul>`
    stagingLinks+=` <div class="col">
    Staging
    <ul>`
    developmentLinks+=` <div class="col">
    Development
    <ul>`
    Object.keys(PIG).forEach(function(key) {
    
        productionLinks+=`<li><a href='#' host="production-${key}.demandware.net">PROD ${PIG[key]}</a> -
        <a class="bmlink" href="https://production-${key}.demandware.net/on/demandware.store/Sites-Site/default/ViewApplication-DisplayWelcomePage" target="_blank">BM</a>
        </li>`;
        stagingLinks+=`<li><a href='#' host="staging-${key}.demandware.net">STG ${PIG[key]}</a> -
        <a class="bmlink" href="https://staging-${key}.demandware.net/on/demandware.store/Sites-Site/default/ViewApplication-DisplayWelcomePage" target="_blank">BM</a>
        </li>`;
        developmentLinks+=`<li><a href='#' host="development-${key}.demandware.net">DEV ${PIG[key]}</a> -
        <a class="bmlink" href="https://development-${key}.demandware.net/on/demandware.store/Sites-Site/default/ViewApplication-DisplayWelcomePage" target="_blank">BM</a>
        </li>`;
        })
        productionLinks+=` </ul>
    </div>`
        stagingLinks+=` </ul>
    </div>`
        developmentLinks+=` </ul>
    </div>`
}


const jsFileContent = fs.readFileSync('./script.js', 'utf8');
const cssFileContent = fs.readFileSync('./style.css', 'utf8');

export const createHTML = function (data, host) {

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
               ${jsFileContent}

    </script>
         <style>
           ${cssFileContent}
    </style>
        <title>SFCC-One Page Preferences</title>
      </head>
      <body>
    <div>
        <h2 class="text-center mt-4 mb-4">SFCC-One Page Preferences</h2>
        <div class="container">
		<div class="row easy-links">
            ${sigLinks}
            ${developmentLinks}
            ${stagingLinks}
            ${productionLinks}
		</div>
        </div>

<div class="d-flex ">
	    
    <div class="input-group mb-1 m-2" style="width: 31vw;">
        <input type="text" class="form-control host-value" placeholder="Host to change Group URLs" >
        <div class="input-group-append">
            <button class="btn btn-outline-secondary change-host" type="button">Change</button>
        </div>
    </div>
	
    <div class="button-wrapper">
       <input type="text" class="form-control m-2  search" placeholder="Search Site Preference" style="width: 51vw;">
    </div>

</div>


    <table class="table table-sm table-striped table-bordered table-hover">
    <thead>
        <tr class="table-primary">
          <th scope="col">#</th>
    `);

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
    let groupIndex = 0;
    for (let group in data) {
        let groupBM_URL = `<a href="https://${host}/on/demandware.store/Sites-Site/default/ViewApplication-BM?#/?preference#site_preference_group_attributes!id!${group}" target="_blank">${group}</a>`
        let groupClass = `group${groupIndex++}`;

        writeFile.write(`<tr class="search-row group-row ${groupClass}">
        <th scope="row"  class="table-primary search-field">${groupBM_URL}</th>
        </tr>`)

        if (data[group].hits) {
            for (let hit of data[group].hits) {
                let attributeName = hit.display_name && hit.display_name.default ? hit.display_name.default : '';

                writeFile.write(`<tr class="search-row" data-group="${groupClass}">
            <th scope="row" class="search-field" title="Group - ${group}">${attributeName}<span class="font-weight-light">
             (${hit.id})</span></th>
            `)
                if (hit.site_values) {
                    let defaultValue = hit.attribute_definition && hit.attribute_definition.default_value ? hit.attribute_definition.default_value.value : '';
                    let valueType = hit.attribute_definition && hit.attribute_definition.value_type;
                    let isJSON = false;
                    for (let siteValue in hit.site_values) {
                        let value = hit.site_values[siteValue] && hit.site_values[siteValue].markup ? hit.site_values[siteValue].markup : hit.site_values[siteValue];
                        if (value === null) {
                            value = defaultValue;
                        }
                        if (value && typeof value === 'string' && value.indexOf('<') >= 0 && value.indexOf('>') >= 0) {
                            value = value.replace(/</g, '&lt;').replace(/>/g, '&gt;');
                        }
                        if(valueType && valueType==='text'){
                            try{
                                value = JSON.parse(value);
                                value = JSON.stringify(value,null,2);
                                isJSON = true;
                            }catch(e){

                            }

                        }
                        writeFile.write(`<td class="col-2 search-field">${value} ${isJSON ?  `<button class="format-button">{;}</button>` : ''}</td>`)
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