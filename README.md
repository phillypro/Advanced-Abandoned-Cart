# Advanced-Abandoned-Cart
Advanced Abandoned Cart


The Options we want them to be able to change

background color
font color

label color
input background color
input font color

continue button color



The install we need to have is

create a snippet and place it at the bottom of theme.liquid right before the </body> tag

After Install

default abandoned cart email

If you are using the default abandoned cart email template
copy the contents of this file 

and replace your your existing abandoned checkout template located here

if you have a custom abandoned checkout email simply replace any instance of
{{ url }}  

with 
{{ url }}{% if shipping_address.address1 == '.' %}&step=contact_information{% endif %}

That's it...you're all set!

