use anchor_lang::prelude::*;

declare_id!("32Yu1ovezPREKDrdCNBEMuKGz3TXD5Ss79FNdA6T6BU4");

#[program]
pub mod myepicproject {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        // Get a reference to the account
        let base_account = &mut ctx.accounts.base_account;
        // Initialize total_gifs
        base_account.total_gifs = 0;
        Ok(())
    }

// The function now accepts a gif_link param from the user. We also reference the user from the Context
pub fn add_gif(ctx: Context<AddGif>, gif_link: String) -> Result <()> {
    // Get a reference to the account and increment total_gifs
    let base_account = &mut ctx.accounts.base_account;
    let user = &mut ctx.accounts.user;

    // Build the struct
    let item = ItemStruct {
        gif_link: gif_link.to_string(),
        user_address: *user.to_account_info().key,
    };

    // add it to the gif_list vector
    base_account.gif_list.push(item);

    base_account.total_gifs += 1;
    Ok(())
}
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = user, space = 9000)]
    pub base_account : Account<'info, BaseAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program <'info, System>,
}

#[derive(Accounts)]
pub struct AddGif<'info>{
    #[account(mut)]
    pub base_account: Account<'info, BaseAccount>,
    #[account(mut)]
    pub user: Signer<'info>
}

// create a custom struct 
#[derive(Debug, Clone, AnchorSerialize, AnchorDeserialize)]
pub struct ItemStruct {
    pub gif_link: String,
    pub user_address:Pubkey,
}

#[account]
pub struct BaseAccount{
    pub total_gifs: u64,
    pub gif_list: Vec<ItemStruct>,
}
