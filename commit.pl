#!/usr/bin/perl

use strict;

my $name = shift @ARGV || die "\nLack of commit name\n\n";

foreach my $arg ( @ARGV ) {
  $name .= " $arg";
}

my @files = qw("commit.pl"
	       "package.json"
	       "freiworld.js"
	     );

foreach my $file ( @files ) {
  system("git add $file");
}


system("git commit -m '$name'\n");
