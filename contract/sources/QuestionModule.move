module QuestionModule::QuestionContract {
    use std::signer;
    use std::vector;
    use aptos_framework::coin;
    use aptos_framework::aptos_coin;

    // Define a struct to store questions
    struct QuestionStore has key, store {
        questions: vector<vector<u8>>,
    }

    // Initialize the module by publishing a QuestionStore for the deployer
    public entry fun init(account: &signer) {
        assert!(signer::address_of(account) == @0x1, 0);
        move_to(account, QuestionStore { questions: vector::empty<vector<u8>>() });
    }

    // Function to submit a question
    public entry fun submit_question(account: &signer, question: vector<u8>) acquires QuestionStore {
        let store = borrow_global_mut<QuestionStore>(signer::address_of(account));
        vector::push_back(&mut store.questions, question);
    }

    // Function to get all submitted questions
    public fun get_all_questions(account: &signer): vector<vector<u8>> acquires QuestionStore {
        let store = borrow_global<QuestionStore>(signer::address_of(account));
        store.questions
    }

    // Function to deposit funds (using AptosCoin as the currency)
    public entry fun deposit_funds(account: &signer, amount: u64) {
        coin::transfer<aptos_coin::AptosCoin>(account, @0x1, amount); // Transfer funds to contract address
    }

    // Function to check contract balance (for AptosCoin)
    public fun get_balance(account: &signer): u64 {
        coin::balance<aptos_coin::AptosCoin>(signer::address_of(account))
    }
}
