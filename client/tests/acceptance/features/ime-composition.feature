Feature: IME composition
  Background:
    Given the user is logged in with email or username "demo" and password "demo"
    And a card with an empty task list exists

  Scenario: Confirming an IME composition with Enter does not submit the task form
    When the user opens the card
    And the user opens the add task form
    And the user presses Enter while composing "かいぜん" with an IME
    Then the composed text "かいぜん" should remain in the task field
    And no task named "かいぜん" should be added
