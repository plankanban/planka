Feature: Login
  Background:
    Given the user navigates to the login page

  Scenario: User logs in with valid credentials
    When the user logs in with email or username "demo" and password "demo" via the web UI
    Then the user should be redirected to the home page

  Scenario Outline: User logs in with invalid credentials
    When the user logs in with email or username "<emailOrUsername>" and password "<password>" via the web UI
    Then the user should see the message "<message>"

    Examples:
      | emailOrUsername | password  | message             |
      | spiderman       | spider123 | Invalid credentials |
      | ironman         | iron123   | Invalid credentials |
      | aquaman         | aqua123   | Invalid credentials |

  Scenario: User logs out
    Given the user is logged in with email or username "demo" and password "demo"
    When the user logs out via the web UI
    Then the user should be redirected to the login page
