**PLANKA License Guide**

Version 1.0 - Last updated: May 2, 2025

Related files in English:
- [PLANKA Community License EN.md](https://github.com/plankanban/planka/blob/master/LICENSES/PLANKA%20Community%20License%20EN.md)
- [PLANKA Enterprise License EN.md](https://github.com/plankanban/planka/blob/master/LICENSES/PLANKA%20Enterprise%20License%20EN.md)
- PLANKA License Guide EN.md (this file)

Related files in German:
- [PLANKA Community License DE.md](https://github.com/plankanban/planka/blob/master/LICENSES/PLANKA%20Community%20License%20DE.md)
- [PLANKA Enterprise License DE.md](https://github.com/plankanban/planka/blob/master/LICENSES/PLANKA%20Enterprise%20License%20DE.md)
- [PLANKA License Guide DE.md](https://github.com/plankanban/planka/blob/master/LICENSES/PLANKA%20License%20Guide%20DE.md)

---

## PLANKA's "Fair Use License" and the "PLANKA Enterprise License"

Our [Fair Use License](https://github.com/plankanban/planka/blob/master/LICENSES/PLANKA%20Community%20License%20EN.md) and our [PLANKA Enterprise License](https://github.com/plankanban/planka/blob/master/LICENSES/PLANKA%20Enterprise%20License%20EN.md) are based on the [fair-code](http://faircode.io) model.

#### Proprietary licenses for enterprise and the "PLANKA Educational License"

We offer proprietary licenses to our enterprise customers, but also the "PLANKA Educational License" for schools and universities. Please contact us for detailed information at [license@planka.group](mailto:license@planka.group).

# License FAQs

### What license do you use for PLANKA?

PLANKA uses the [Fair Use License](https://github.com/plankanban/planka/blob/master/LICENSES/PLANKA%20Community%20License%20EN.md) and the [PLANKA Enterprise License](https://github.com/plankanban/planka/blob/master/LICENSES/PLANKA%20Enterprise%20License%20EN.md). These licenses are based on the [fair-code](http://faircode.io) model.

### What source code is covered by the PLANKA's "Fair Use License"?

The [Fair Use License](https://github.com/plankanban/planka/blob/master/LICENSES/PLANKA%20Community%20License%20EN.md) applies to our source code hosted in our [main GitHub repository](https://github.com/plankanban/planka) except:

* Content of branches other than the main branch (usually "master" or "main").

* Source code files or other files that contain ".pe." (for "PLANKA Enterprise") in their file names or folder names.

* Source code files that are marked as "PLANKA Enterprise" in their file headers or folders.

* Source code in folders that contain separate license files that clearly mark them as "PLANKA Enterprise".

These exceptions are licensed under the [PLANKA Enterprise License](https://github.com/plankanban/planka/blob/master/LICENSES/PLANKA%20Enterprise%20License%20EN.md).

### What is the "Fair Use License"?

The "Fair Use License" falls under the so-called [fair-code](http://faircode.io) licenses category. PLANKA's license is based on and extends the "Sustainable Use License" introduced by [n8n](https://n8n.io) who's advice was greatly appreciated. With similar goals in mind, we decided to follow their lead and adopt their model for our own needs. [Further below](#why-did-you-choose-this-license) you can read why we chose this license.

The license allows you the free right to use, modify, create derivative works, and redistribute with three limitations:

- You may use or modify the software (a) for personal, hobby, or educational purposes, or (b) inside your own legal entity (including wholly owned subsidiaries) for workflows that are not offered as a paid product or as a cross-company service to any third party.

- You may not alter, remove, or obscure any licensing, copyright, or other notices of the licensor in the software. Any use of the licensor's trademarks is subject to applicable law.

- "You may use the PLANKA name or logo to factually describe that your service incorporates or in other ways uses PLANKA software. Any other trademark use (e.g., in product names or brands, domain names, or marketing material) requires our prior written consent."

### What is and is NOT allowed under the license in the context of PLANKA's products?

Our license restricts use to "internal business purposes". In practice this means all use is allowed unless you are selling a product, service, or module in which the value derives entirely or substantially from PLANKA functionality.

###### Here are some examples that would not be allowed:

- White-labeling PLANKA and offering it to your customers or affiliates for money.

- Hosting PLANKA and charging people money to access it.

- Use PLANKA's API to power services for which money is charged.

- Use of PLANKA to connect your own legal entity with legal entities or persons outside your own legal entity.

- Use PLANKA to conduct or support any kind of illegal or unlawful activity.

###### All of the following examples are allowed under our license:

- Using PLANKA to control your internal processes and manage your internal projects.

- Integrate PLANKA into other internally used products to enhance their capabilities.

- Providing consulting or educational services related to PLANKA, for example, to build or integrate workflows for or in connection with PLANKA or develop custom modules to extend its functionalities.

- Supporting PLANKA, for example, by setting it up or maintaining it on an internal company server.

### Is it allowed to use PLANKA as a backend integration?

If you use PLANKA and its backend and related services outside the boundaries of internal operations and integrations within your own organization, you need to buy a "PLANKA Enterprise License". This also applies if you want to use PLANKA as a core backend infrastructure for third-party applications, services, or a system that is distributed to or accessed by external parties.

Any arrangement that involves sublicensing, repackaging, or otherwise making PLANKA available to external parties or integrating PLANKA into another product to serve as the primary operational engine for that product also requires a valid "PLANKA Enterprise License" or proprietary license available for our enterprise customers.

### Can you give me some quick examples to clarify free use vs. enterprise use?

---

##### Example 1: Use PLANKA's API to control or respond to fabrication machinery processes

Use our API to show and control the feedback coming from fabrication steps inside your company or to control production line events by moving cards.

**ALLOWED** under the "Fair Use License". You can integrate PLANKA into your other systems to use its API to control your internal processes.

##### Example 2: Offer commercial consulting or support services

You provide a service to your client to help them implement new workflows and board concepts into the PLANKA setup.

**ALLOWED** under the "Fair Use License". You are free to offer commercial consulting or integration and support services for PLANKA without the need for a separate license agreement with us.

##### Example 3: Bundle PLANKA in a free and public Docker image

A school or charity bundles PLANKA in a free, public Docker image for students who want to use PLANKA to organize their fields of study.

**ALLOWED** under the "Fair Use License". Since PLANKA is given away for free and without commercial revenues in mind, you are more than welcome to allow charitable entities and schools better access to PLANKA.

**HOWEVER** if you also plan to provide students access to an otherwise school's internal PLANKA instance, this would require our "PLANKA Educational License", which we will gladly offer on request.

##### Example 4: Provide PLANKA logins to clients and affiliates

To facilitate better project feedback, you offer your client and someone from a joint venture access to project boards inside your company. They can now comment on cards and also benefit from PLANKA's real-time update capabilities.

**NOT ALLOWED** under the "Fair Use License". Offering PLANKA as part of a paid service to third parties or providing PLANKA access to third-party users outside your own legal entity requires you to register a "PLANKA Enterprise License".

##### Example 5: Offer PLANKA as a hosted product to other companies

You want to earn money by providing PLANKA to companies, freelancers, and other people. This way they have easy access to project management and control from everywhere.

**NOT ALLOWED** under the "Fair Use License". Selling PLANKA-based services requires you to agree to a "PLANKA Reseller License". We have a special hosting agreement for those who want to provide paid PLANKA service to customers or simply act as resellers for our own "PLANKA Corporate Hosting Services".

---

### What if I want to use PLANKA for something that's not permitted by the license?

You must sign a separate commercial agreement with us. We actively encourage software integrators and technical staff to integrate and connect PLANKA within their other products and use our extensive API to respond to, control, and master processes within their company; we just ask them to sign an agreement laying out the terms of use and the license fees required by PLANKA for using the product. Through PLANKA's API, it is capable of controlling and responding to external systems. You can learn more [here](https://docs.planka.cloud/docs/category/api-reference) or contact us about it.

If you are unsure whether the use case you have in mind constitutes an internal business purpose or not, take a look at the [examples above](#can-you-give-me-some-quick-examples-to-clarify-free-use-vs-enterprise-use), and if you're still not sure, please contact us at [license@planka.group](mailto:license@planka.group).

### Why don't you use a default open-source license?

We spend a lot of time creating an easy yet powerful tool that makes controlling and mastering projects a fun experience. Also, we wanted PLANKA to be as widely and freely available as possible while also ensuring that we can build a sustainable and viable business. By making our product free to use, easy to distribute, and source-available, we help everyone access the product. By operating as a business, we can develop and release new features, fix bugs, and provide reliable software at scale long-term.

### Why did you choose this license?

We believe that the "Fair Use License" is beneficial for the community as well as for the developers. Development is a costly enterprise, and giving away a community version for free is a risk that many companies don't survive without selling software or the company. Therefore, many open-source companies live from donations or financial investors. Instead of selling our soul, we sell services and software licenses. This way we continue to grow, code, and support our community. So the short answer is "Live and let live" is how we feel about PLANKA.

Therefore, we are helping to promote [fair-code](https://faircode.io) software with the goal of making it a well-known umbrella term to describe software models like ours. To keep any friction around our proprietary license to an absolute minimum, we focus on two things:

1. Plain language, minimal length - the license is written in clear, concise English (a German version exists as well), with only the clauses absolutely needed.

2. Advocating fair-code - we actively promote the fair-code model so people recognize it as a straightforward, sustainable way to share and improve software like PLANKA.

### My company has a policy against using code that restricts commercial use - can I still use PLANKA?

Provided you are using PLANKA for internal business purposes and not making PLANKA available to your customers or affiliates, then of course you should be able to use PLANKA. If you are unsure whether the use case you have in mind constitutes an internal business purpose or not, take a look at the [examples above](#can-you-give-me-some-quick-examples-to-clarify-free-use-vs-enterprise-use), and if you're still unclear, email us at [license@planka.group](mailto:license@planka.group).

### What happens to code I contribute to PLANKA in regard to its "Fair Use License"?

Any code you contribute on GitHub is subject to GitHub's [terms of use](https://docs.github.com/en/site-policy/github-terms/github-terms-of-service#d_user_generated_content). In simple terms, this means you own and are responsible for anything you contribute, but that you grant other GitHub users certain rights to use this code. When you contribute code to a repository containing notice of a license, you license the code under the same terms.

PLANKA asks every contributor to sign our [Contributor License Agreement](https://github.com/plankanban/planka/blob/master/CONTRIBUTOR_LICENSE_AGREEMENT.md). In addition to the above, this gives PLANKA the ability to change its license without seeking additional permission. It also means you aren't liable for your contributions (e.g., in case they cause damage to someone else's business).

It's easy to get started contributing code to PLANKA on [GitHub](https://github.com/plankanban), and we've listed broader ways of participating in our community [here](https://github.com/plankanban/planka/blob/master/CONTRIBUTING.md).

### Is PLANKA open source?

PLANKA's source code is freely available under the "Fair Use License". While this doesn't align with the Open Source Initiative's strict definition (which doesn't allow any use limitations), PLANKA still offers nearly all the same benefits as traditionally open-source software to most users, including corporations.

We embrace what's often called the 'fair-code' model - our code is source-available and follows a simple "Live and let live" philosophy. This approach allows us to maintain a sustainable company while still providing transparency and flexibility to our community. Many companies are adopting this balanced licensing approach that preserves the spirit of openness while ensuring the project's long-term viability. We're proud to be part of this movement!

### What is fair-code, and how does the "Fair Use License" relate to it?

Fair-code is not a software license. It describes a software model where software:

- Is generally free to use and can be distributed by anyone.

- Has its source code openly available.

- Can be extended by anyone in public and private communities.

- Is commercially restricted by its authors.

The "Fair Use License" is a fair-code license. You can read more about it and see other examples of fair-code licenses [here](https://faircode.io). To get in touch with us about license questions, please email [license@planka.group](mailto:license@planka.group).

### Can I use the "Fair Use License" for my own project?

Yes! We ourselves made use of the "Fair Use License" by following others' footsteps who openly invite others on their website and in their license to follow the fair code path. Like them, we're excited to see more software use the "Fair Use License".
