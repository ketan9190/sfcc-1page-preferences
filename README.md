# SFCC-One Page Preferences

It is used to build a one page view of all the sites preferences within a SFCC instance.
![demo_sfcc-1page-preferences](https://user-images.githubusercontent.com/33390019/181574724-7dc71227-cf04-4e07-a537-79e32c972cdf.gif)

## Prerequisites

#### Minimum Node Version Required : 14.14.0
#### OCAPI settings in BM:
- Go to Administration > Site Development > Open Commerce API Settings
- Select Type : Data
- Select Context : Global
- Settings for default client id (Change the client id if required)
```
{
	"_v":"21.3",
	"clients":[
		{
			"client_id":"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
			"resources":[
				{
					"resource_id":"/system_object_definitions/**",
					"methods":[
						"get"
					],
					"read_attributes":"(**)",
					"write_attributes":"(**)"
				},
				{
					"resource_id":"/site_preferences/**",
					"methods":[
						"post"
					],
					"read_attributes":"(**)",
					"write_attributes":"(**)"
				}
			]
		}
	]
}
```

## Getting started
```
npm install sfcc-1page-preferences -g
```

## Usage
sfcc-1page-preferences [options]

Sample command when installed globally
```
sfcc-1page-preferences -h=<hostname> -c=<clientId> -p=<clientPassword>
OR
sfcc-1page-preferences --hostname=<hostname> --clientId=<clientId> --clientPassword=<clientPassword>
```
May skip clientId and clientPassword when they are default aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa

## Options
<pre>
--help                        Generate help message
-h, --hostname                Hostname of the SFCC Business Manager instance
-c, --clientId                OCAPI client ID
-p, --clientPassword          OCAPI client password
</pre>
Default clientId and clientPassword (aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa) will be used if it is not provided.
