Feature: login
    As a admin
    I want to log in
    So that I can manage project


  Scenario: User logs in with valid credentials
    Given user has browsed to the login page
    When user logs in with username "demo@demo.demo" and password "demo" using the webUI
    Then the user should be in dashboard page


  Scenario Outline: login with invalid username and invalid password
    Given user has browsed to the login page
    When user logs in with username "<username>" and password "<password>" using the webUI
    Then user should see the error message "<message>"
    Examples:
      | username  | password | message             |
      | spiderman | spidy123 | Invalid credentials |
      | ironman   | iron123  | Invalid credentials |
      | aquaman   | aqua123  | Invalid credentials |


  Scenario: User can log out
    Given user has logged in with email "demo@demo.demo" and password "demo"
    When user logs out using the webUI
    Then the user should be in the login page
