---
title: Update Security Group Policy
description: how to update a security group policy
---

Use the 3 blocks to add nodes to your diagram.
![blocks](../../../assets/sgc-blocks.png)

Connect blocks via the `in` and `out` icons
![blocks](../../../assets/sgc-in-out.png)


## Outbound
- Click the `outbound` block to add an outbound rule to the diagram. 
- Connect a security group by clicking its `out` icon and then select the outbound block's `in` icon.
- Update the outbound cidr range by clicking the block and putting in the cidr range and clicking the check button in the right panel
- Delete the outbound block by clicking the block and clicking the trash button in the right panel

## Inbound
- Click the `inbound` block to add an inbound rule to the diagram. 
- Connect a security group by clicking the `out` icon on the inbound block and select the `in` icon on a security group.
- Update the inbound cidr range by clicking the block and putting in the cidr range and clicking the check button in the right panel
- Delete the inbound block by clicking the block and clicking the trash button in the right panel

## Security Group
- Click the `security group` block to add a security group to the diagram.
- You can nest security groups with other security groups by connecting `in` to `out` icons or the verse. 
- Update the security group name by clicking the block, modifying the name input, and clicking the check button in the right panel.
- Update the instances the security group is attached to by clicking the block, modifying the comma seperated instance input field, and clicking the check button in the right panel. The input field should be a string of `,` seperated instance ids without spaces.
- Delete the `security group` block by clicking the block and clicking the trash button in the right panel

## Ports
- Update ports by selecting any line between blocks, specify a comma seperated list, and click the check button in the right panel. Valid ports can be defined in the following ways:
    - ANY
    - ICMP
    - TCP [PORT]
    - UDP [PORT]
- The input field should be a string of `,` seperated ports without spaces.