##What is My Lifelong Learning Lab?

A part of the [FLOE Preference Exploration and Self-Assessment](https://wiki.fluidproject.org/display/fluid/%28Floe%29+Preference+Exploration+and+Self-Assessment) work.

##Building

Requirements:
* `npm`

Steps:
* `npm install`
    * postinstall should run the `grunt installFrontEnd` task after installation completes; this task:
        * runs `npm install` in `node_modules/infusion` to install Infusion's build dependencies
        * builds Infusion from the install in `node_modules/infusion` with `grunt build`
        * copies Infusion and other front-end dependencies from `node_modules`

Result:
* The root directory can now serve up the demos and tests as a static site
