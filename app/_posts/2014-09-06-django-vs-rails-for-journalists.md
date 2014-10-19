---
layout: post
title:  "Django to Rails - A selective guide in their differences for data journalists"
---

A former colleague and great friend of mine, Agustin Armendariz, recently joined the The New York Times to do some amazing investigative data reporting.

For those who don't know, he's a Python guy and the Times is primarily a Ruby shop.

I started out as a Rails programmer, and though I primarily use Django these days, I still have a lot of love for Ruby and Rails. Knowing this, Agustin emailed me and asked if I could break down some of the differences between the two languages and their frameworks.

While there are a billion Django Vs. Ruby guides on the Internet, there wasn't one tailored toward data journalist and news app developers. So what follows is a drive-by walkthrough of the frameworks with many off-the-top explanations of its concepts.

__This isn't meant to be used in a classroom nor do I consider this a definitive guide.__

It's a *high-level explanation* of two frameworks to a friend. Given the interest in news application development these days, I thought I'd publish what I wrote.

If you're just starting out as a programmer, this guide probably won't help and I suggest you explore the tutorials provided by both frameworks:

- [ Official Django Project Tutorial](https://docs.djangoproject.com/en/1.7/intro/tutorial01/)
    - Chicago Tribune's Andy Boyle has a great guide to building news applications with Django. Read it!: [Andy Boyle's Django tutorials](http://www.andymboyle.com/django-tutorials/)
- [Official Ruby on Rails Guides](http://guides.rubyonrails.org/)
    - Michael Hartl's Rails tutorial is also excellent: [Rails Tutorial](https://www.railstutorial.org/)

Enjoy!

Aaron

## Rails vs. Django

For the most part, Python and Ruby are very similar. They're [dynamically typed languages](https://en.wikipedia.org/wiki/Type_system#DYNAMIC) that are built for all kinds of uses. Python is heavily backed by the science community so tools like numpy, nltk, pandas, fuzzywuzzy, etc. are missing from the Ruby ecosystem. **That really sucks** for data journalist used to working with these libraries.

That said, what you will gain with Ruby is a language and library ecosystem that evolves and adapts quickly. Ruby is at version 2.0 and Rails at 4.x. Both were adopted fairly quickly. Compare that to Python 3! Also, Rails makes a lot of assumptions on how you want to build web apps and thus makes it super simple to go from *some idea* to __newsapp.com__.

I initially gravitated to Ruby/Rails for that very reason. While I love Python (now), Ruby offered gratification much quicker as a novice programmer. So with that, let's look at an API I wrote to scrape California wildfire data and build an API.

#### Quick notes

#### Rails 3.x
I'm using a fork of Rails called [Rails-API](https://github.com/rails-api/rails-api) that removes a lot of the cruft from the default Rails scaffold and helps you build API only applications. Think of it like using a version of Django that had views and tests removed and JSON endpoints for views instead of of HTML templates. I converted this application from a full Rails app to the API only version as an exercise, but you'll still be able to learn the "Rails" way with this app.

Also, this was built with Rails 3. Rails 4 is the new hottness. While most of what I did is the same in Rails 4, some shit may be different.

#### MVC vs MTV
OK, so some quick semantics. In Django you have Models (your data representation), Templates(what they look like) and Views(where they go) - sometimes called MTV. In Rails you have Models (your data), Views (what they look like) and Controllers (where they go) - often called MVC. Understanding this will make your life a lot easier.

#### Use the getting started
Just like Django, the Rails getting started tutorial is pretty solid and will teach you a bunch of staff about the framework and the language. It's definitely worth your time to explore: http://guides.rubyonrails.org/getting_started.html

#### Branches
The code for this app is listed at https://github.com/aboutaaron/fire-scraper

There's an `api` branch and the `master`. The `api` branch has the better Rails code in it but doesn't have the default project scaffold. The `master` branch has some ugly code but is closer to the default Rails project scaffold. I jump between the two in this walkthrough but feel free to inspect the code base yourself.

Okay, without further ado, let's walk through a Rails app.

## Our App
[Fire-scraper](https://github.com/aboutaaron/fire-scraper) is a Rails app that scrapes wildfire data, stores it in a SQL database and then offers JSON endpoints for users to consume. The endpoints are listed here: http://calfire-api.herokuapp.com/. I then wrote a frontend app to display the info. You can see a crappy version of the frontend here: https://aboutaaron.github.io/fuego/. How does it work?

## Models
So, with a Django project, you have the `site > project > app ` structure. Each app has a `model.py` with every model definition inside of it and apps are kind of the main event right?

Well, in Rails, there are no *apps*. Your models are the main attraction and each model gets a file located in `app/models/{{ model_name }}.rb`.

So looking here https://github.com/aboutaaron/fire-scraper/tree/api/app/models you can see that Counties and Fires, my models, get their own files. And so your foreign keys happen in the appropriate files. In this case, a County `:has_many` Fires and all Fires `:belongs_to` a County.

`app/models/county.rb`
```rb
class County < ActiveRecord::Base
  extend FriendlyId
  friendly_id :name, use: :slugged
  attr_accessible :name

  validates :name, uniqueness: true, presence: true

  has_many :fires
  accepts_nested_attributes_for :fires

  geocoded_by :full_address
  after_validation :geocode

  def full_address
    name + " County, California, USA"
  end
end
```
`app/models/fire.rb`
```rb
class Fire < ActiveRecord::Base
  attr_accessible :acreage, :containment, :date, :location, :name, :county_id, :active

  validates :acreage, :date, :name, :location, :county_id, presence: true

  validates :location, uniqueness: true

  belongs_to :county
end
```

As you can already tell, this is a strength of Ruby. All you need to add are the `has_many :child_model` and `belongs_to :parent_model` attributes in the corresponding files and you have a foreign key relationship. __THIS__, in my opinion, is why people like Rails. It's almost like you're describing an app you're building rather than building one, and yet, when you run the server, there's your app humming away.

## URLs

### Views/Controllers
So in Django, you usually have the `views.py` that takes a your model and attaches the data to some kind of template. And then you have your `urls.py` file that handles all the URL routing between the two (when a user hits this url, takes this view and assign the data to this template).

Well, in Rails the `views.py` equivalent are your `Controller` files. Located in `app/controllers/` these files will move your model data to your templates.

https://github.com/aboutaaron/fire-scraper/blob/api/app/controllers/counties_controller.rb
```rb
  def index
    @counties = County.all

    respond_to do |format|
      format.json { render }
    end
  end
```

So here, you can see that the `def index` method represents the URL path. We're grabbng all the counties and storing them in the `@counties` instance variable (instance variables have an @ in front of them and basically act as class level attributes) and then we have a block (HUGE thing in Ruby) to say what format this data should be represented in. So, in the example above, when a user hits the counties index page, I want to return a representation of the data as JSON. If I wanted to return the data as HTML I could've also written it like this:
```rb
  def index
    @counties = County.all

    respond_to do |format|
      format.html
    end
  end
```
You can, of course, have HTML and JSON. See an example of this in the `master` branch of the repo: https://github.com/aboutaaron/fire-scraper/blob/master/app/controllers/counties_controller.rb

But the idea is that your have a __PER__ model `model_name.rb` file and a __per__ model `model_name_controller.rb` file.
So, we've defined your model and relationships and we've set up the controller (again, known as a Django View) to route the model info from the database to either JSON, HTML or whatever format we define. How does the controller communicate this information via the URL?

### Routes
Okay, so now we have data moving from the models to a view but how does a user access that data? Well, in Django your `urls.py` connects your **view** logic to your **template** logic. In Rails, this comes down to the `config/routes.rb`. See: https://github.com/aboutaaron/fire-scraper/blob/api/config/routes.rb

```rb
FireScraper::Application.routes.draw do
  resources :counties, :only => [:show, :index], defaults: { format: :json }
  resources :fires, :only => [:index], defaults: { format: :json }
end
```

I won't go into explaining this logic but basically we're loading the model resources (fires, counties) and telling `routes.rb` what controllers to look at. In my case, we're only looking at the index and show views for counties and only the index controller for fires and we're defaulting the format to JSON (though I could easily say HTML or whatever). Remember, in our `Controller`, we defined what template to look at so all routes does is say take a model resource and send it to a controller. See more here: http://guides.rubyonrails.org/routing.html

Boom our URL is humming. This is why Rails is powerful (and scary). With very little code, you can do a shit ton. That said, this is why Pythonistas tend to hate it because it's sometimes unclear what's happening outside of the magic.

## Templates / Views
OK, so models and controllers are defined and we have routes setup to talk to the appropriate controllers. Where do we put our templates? In Rails, templates are called `views` so we check `app/views/`. Again, like everything in Rails, the folders and files are on a __per__ model basis. Rails uses a file type called ERB which stands for **E** mbedded **R** u **B** y. So when Rails sees `index.html.erb`, it knows it can add Ruby data and objects to the document. Typically your model's views (or templates in Django parlance) will have a index.html.erb (think a list view in Django) and a show.html.erb (Think a detail view). So one shows all your models and the other shows what happens you click on a specific instance of a model. See: https://github.com/aboutaaron/fire-scraper/blob/master/app/views/counties/show.html.erb

`/counties/show.html.erb`
```erb
<!-- truncated output -->
<h2><%= @county.name %> County</h2>
<h3><%= @county.fires.count %> fires | <%= total_acres_burned %> acres burned since <%= @county.fires.last.date %></h3>
<table id="show-table" class="eight columns">
  <thead>
    <tr>
      <th>Name</th>
      <th>Acres burned</th>
      <th>Date started</th>
      <th>Containment</th>
    </tr>
  </thead>
  <tbody>
    <% @county.fires.each do |fire| %>
      <tr>
        <td><%= fire.name %></td>
        <td><%= number_with_delimiter(fire.acreage) %></td>
        <td><%= fire.date %></td>
        <td><%= fire.containment %></td>
      </tr>
    <% end %>
  </tbody>
</table>
```
Hopefully this .erb makes sense. I'm grabbing this instance of the county and using ERB template tags `<%= %>` to display info from my model in the HTML. This should feel familiar to the Django dev used to using `{{ }}` to insert data into templates

## Fab/Management Commands
OK so finally, you probably want to know where you can do the **data** part of the app building. By now, I hope it makes sense how Rails and Django are similar and different. You should more or less get how models look, what controllers do and how all of that communicates with your views. But let's get to the fun part.

So for my app, I had to write a scraper to collect wildfire information from CAL Fire. I used [Mechanize](http://docs.seattlerb.org/mechanize/) and [Nokogiri](http://nokogiri.org/) (awesome libraries by the way) to grab the information I want it and store it in a database. How'd I do that and where did it go?

### Rake
So for Rails, rather than have management commands or fab tasks, everything happens with [Rake](https://github.com/jimweirich/rake). Rake, which stands for Ruby Make, allows you to setup tasks to run either view the command line or via CRON. That's entirely up to you. Your tasks live in `lib/tasks/`. The `lib` directory is basically where you store your Ruby code or stuff that isn't super Rails specific. Think of this place of where you might keep a `load.rb` file. So I have a `populate.rb` that does my scraping. Here it is:
```rb
require 'mechanize'

namespace :app do
  desc 'import fire information from Cal Fire'
  task :import => :environment do
    a = Mechanize.new
    a.get('http://cdfdata.fire.ca.gov/incidents/incidents_current?sort=incident_priority&pc=all')

    # .incident_table contains fire. Drop the first table since it's empty
    a.page.search(".incident_table").drop(1).each do |incident|
      # Store metadata
      metadata = incident.search(".odd:nth-child(6) td:nth-child(2)").text

      # Store the name of the county and then create it if it doesn't exist
      @county = incident.search(":nth-child(3) td:nth-child(2)").text.gsub(/\b\sCounty|Counties/,'').gsub(/\W$/,"").gsub(/\s$/,"")
      County.where(:name => @county).first_or_create

      # Store the fire name and then create it if it doesn't exist. Update if it does.
      @fire = incident.search(".odd:nth-child(2) td:nth-child(2)").text.gsub(/\W$/,'')
      fire = Fire.where(:name => @fire).first_or_initialize
      fire.update_attributes(
        :date => Chronic::parse(incident.search(".even:nth-child(7) td:nth-child(2) , .even:nth-child(8) td:nth-child(2)").text),
        :location => incident.search(".odd:nth-child(4) td:nth-child(2)").text,
        :acreage => metadata.match(/^[,0-9]*/).to_s.gsub(',','').to_i,
        :county_id => County.find_by_name(@county).id,
        :containment => metadata.match(/\d*%/).to_s.gsub('%','').to_i,
        :active => (metadata.match(/\d*%/).to_s.gsub('%','').to_i > 0 && metadata.match(/\d*%/).to_s.gsub('%','').to_i < 100 ? true : false)
      )
    end
  end
end
```


I won't do a huge primer on Rake, but basically I've named spaced this task to `:app`. This is just for organization. I could also have a `:deploy` namespace if I wanted stuff just for launch. I then describe that the tasks does and in the `tasks` method I give my task a name like `:import`  and use the rocket operator to have Rake include my app's `:environment`. This is what gives me access to my models.

From there, it's just a scraper that crawls the page and does a `Model.objects.get_or_create` in Django parlance except I'm using the more powerful Rails method `Model.update_attributes`which either creates the model or updates an existing one (Rails also has `get_or_create`. Unfortunately Django doesn't have a `get_or_update` ).

To call my rake task, I'd run this in Terminal:
```bash
$ rake app:import
```

And from there my scraped information goes into the database!

## Some other gotchas
Here's some other stuff to consider with Rails. In no particular order:

- __Database migrations are the default__: Hate using South in Django? Well, too fucking bad because Rails has database migrations be default. They're actually really helpful, but Rails devs will get really pissed at your if you don't have some kind of migration history. So try using it a bit before you do the blowup-and-repopulate technique
- __Study Bundler__: Rails uses Bundler to handle app dependencies and what not. There's a lot you can do with it and the sooner you learn how to package your dependencies by environment (These are my DEV dependencies, these are for STAGING, and these are for PRODUCTION) the sooner you'll be a better Rails dev.
- __Learn the language__: Like Django, you don't necessarily need to know the language Rails is written in to do some damage. That said, knowing Python certainly makes you a better Django dev. The same goes for Rails and Ruby. Learn about blocks, metaprogramming, hash rockets and string interpolation. These are awesome Ruby features that'll make you understand Rails a little better.

## Wrap up

So hopefully this horribly long and horribly written walkthough illuminated some of the idiosyncrasies of Rails to the Django developer. While you lose some of the data manipulation libraries, you gain a lot in fast app scaffolding and deployment. And considering that data powerhouses like ProPublica and NYT use Ruby, I imagine they've found (or built) the data libs you'll need to get your job done. While Python is great, don't sleep on Ruby and Rails as they've time and time again proved to be great tools for developers.
