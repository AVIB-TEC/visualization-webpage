# visualization-webpage 
[![Docker Image CI](https://github.com/AVIB-TEC/visualization-webpage/actions/workflows/docker-image.yml/badge.svg)](https://github.com/AVIB-TEC/visualization-webpage/actions/workflows/docker-image.yml) 
[![Node.js CI](https://github.com/AVIB-TEC/visualization-webpage/actions/workflows/node.js.yml/badge.svg)](https://github.com/AVIB-TEC/visualization-webpage/actions/workflows/node.js.yml)

This repository contains the code for the Angular webpage visualizations. It is configured with CI/CD on the main branch. 

## Running locally
In order to run the webpage locally use the `ng serve` command. This will run the webpage which will be available on `localhost:4200`.


## Adding/Removing node properties
When changing the node properties in the database, the follow steps must be done in order to keep the webpage functional. 

1. Update the models: Go to `src/app/models` and update the model for the node being modified and make sure they have the same properties. 
2. Go to the `src/app/pages/chain/chain.component.ts` Update the `getData` function to match the existing values if necesary.

## Adding/Removing filter options
If the filter option doesn't already exists on the database follow the steps for Adding/Removing node properties and then come back to continue with these instructions. If it already exists follow the next steps.

1. Go to the `src/app/pages/chain/chain.component.html` and update the filter names. Make sure they match for both dropdowns.
2. Go to the `src/app/pages/chain/chain.component.ts` and update the `getMetric` function with the correct mapping for each filter. Add more options if necesary.

## Modifying CI/CD
In the `.github/workflows` folder you can find the different actions created to make this posible. If you wish to add more branches on which these actions are executed you can add the branch names on the list of branches. For example:

``` yaml
on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]
``` 

On the above code snippet is where you can add the branch names for the action to execute. The `push` and `pull_request` represent the event on which it will execute and for which branches. These don't have to have the same branches. Different ones can be used if desired.